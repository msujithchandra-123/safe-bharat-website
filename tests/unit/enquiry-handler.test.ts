import { describe, expect, it } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { handleEnquiryRequest, type EnquiryHandlerDeps } from "@/lib/enquiries/handle-enquiry-request";
import { MemoryRateLimitStore } from "@/lib/security/rate-limit";
import { FakeEmailSender, jsonRequest, validQuote } from "../support/fakes";

const url = "http://localhost:3000/api/v1/enquiries";
const body = (extra: Record<string, unknown> = {}) => ({ ...validQuote, idempotencyKey: "testkey0123456789", turnstileToken: "tok", ...extra });

/** A database double whose every call fails with a message containing sensitive detail. */
const explodingDb = new Proxy(
  {},
  {
    get: () =>
      new Proxy(
        {},
        {
          get: () => async () => {
            throw new Error("connect ECONNREFUSED 10.0.0.5:5432 password=hunter2 user=admin");
          },
        },
      ),
  },
) as unknown as PrismaClient;

function deps(overrides: Partial<EnquiryHandlerDeps> = {}): EnquiryHandlerDeps {
  return {
    service: () => ({ db: explodingDb, email: new FakeEmailSender(), notificationRecipients: ["ops@example.com"], sendAcknowledgement: false }),
    rateLimitStore: () => new MemoryRateLimitStore(),
    verifySpam: async () => ({ ok: true }),
    rateLimitSalt: "salt",
    attachmentsEnabled: false,
    ...overrides,
  };
}

describe("POST /api/v1/enquiries handler", () => {
  it("rejects unsupported content types", async () => {
    const req = new Request(url, { method: "POST", headers: { "content-type": "text/plain" }, body: "hi" });
    expect((await handleEnquiryRequest(req, deps())).status).toBe(415);
  });

  it("returns field errors for invalid submissions", async () => {
    const res = await handleEnquiryRequest(jsonRequest(url, body({ email: "nope" })), deps());
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.fields.email).toBeTruthy();
  });

  it("rejects malformed JSON safely", async () => {
    const res = await handleEnquiryRequest(jsonRequest(url, "{not json"), deps());
    expect(res.status).toBe(422);
  });

  it("rejects honeypot submissions", async () => {
    const res = await handleEnquiryRequest(jsonRequest(url, body({ website: "http://spam.example" })), deps());
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("SPAM_CHECK_FAILED");
  });

  it("rejects submissions whose spam token fails server verification", async () => {
    const res = await handleEnquiryRequest(jsonRequest(url, body()), deps({ verifySpam: async () => ({ ok: false, reason: "invalid-token" }) }));
    expect(res.status).toBe(400);
  });

  it("returns 503 when spam protection is not configured in production", async () => {
    const res = await handleEnquiryRequest(jsonRequest(url, body()), deps({ verifySpam: async () => ({ ok: false, reason: "not-configured" }) }));
    expect(res.status).toBe(503);
  });

  it("rate limits repeated submissions", async () => {
    const store = new MemoryRateLimitStore();
    const d = deps({ rateLimitStore: () => store, verifySpam: async () => ({ ok: false, reason: "invalid-token" }) });
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await handleEnquiryRequest(jsonRequest(url, body()), d)).status);
    expect(statuses.slice(0, 5).every((s) => s === 400)).toBe(true);
    expect(statuses[5]).toBe(429);
  });

  it("never exposes raw database errors", async () => {
    const res = await handleEnquiryRequest(jsonRequest(url, body()), deps());
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).not.toMatch(/ECONNREFUSED|password|hunter2|10\.0\.0\.5/);
    expect(JSON.parse(text).error.code).toBe("INTERNAL_ERROR");
  });

  it("returns 503 when the database is not configured", async () => {
    const res = await handleEnquiryRequest(
      jsonRequest(url, body()),
      deps({
        service: () => {
          throw new DatabaseNotConfiguredError();
        },
      }),
    );
    expect(res.status).toBe(503);
  });

  it("rejects attachments when uploads are disabled", async () => {
    const form = new FormData();
    form.set("payload", JSON.stringify(body()));
    form.set("attachment", new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], "a.pdf", { type: "application/pdf" }));
    const req = new Request(url, { method: "POST", body: form, headers: { "x-real-ip": "203.0.113.1" } });
    const res = await handleEnquiryRequest(req, deps());
    expect(res.status).toBe(422);
    expect((await res.json()).error.fields.attachment).toBeTruthy();
  });

  it("rejects cross-site browser submissions", async () => {
    const res = await handleEnquiryRequest(jsonRequest(url, body(), { origin: "https://evil.example" }), deps());
    expect(res.status).toBe(401);
  });
});
