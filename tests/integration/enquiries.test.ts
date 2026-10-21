import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createPrismaClient } from "@/lib/db";
import {
  purgeExpiredEnquiries,
  retryPendingNotifications,
  submitEnquiry,
  type EnquiryServiceDeps,
} from "@/lib/enquiries/enquiry-service";
import { handleEnquiryRequest } from "@/lib/enquiries/handle-enquiry-request";
import { REFERENCE_PATTERN } from "@/lib/enquiries/reference";
import { checkRateLimits, PostgresRateLimitStore } from "@/lib/security/rate-limit";
import { validateAttachment } from "@/lib/storage/attachments";
import { enquiryPayloadSchema, type EnquiryPayload } from "@/lib/validation/enquiry";
import { FakeEmailSender, FakeStorage, jsonRequest, validQuote } from "../support/fakes";

const db = createPrismaClient(process.env.TEST_DATABASE_URL!);
let keyCounter = 0;
const key = () => `itest${Date.now()}${(keyCounter++).toString().padStart(6, "0")}`;
const payload = (overrides: Record<string, unknown> = {}): EnquiryPayload => enquiryPayloadSchema.parse({ ...validQuote, ...overrides });

function deps(email = new FakeEmailSender(), extra: Partial<EnquiryServiceDeps> = {}): EnquiryServiceDeps {
  return { db, email, notificationRecipients: ["sales@example.com"], sendAcknowledgement: true, ...extra };
}

beforeEach(async () => {
  await db.enquiry.deleteMany();
  await db.rateLimitBucket.deleteMany();
});

afterAll(async () => {
  await db.enquiry.deleteMany();
  await db.rateLimitBucket.deleteMany();
  await db.$disconnect();
});

describe("enquiry persistence", () => {
  it("saves a valid enquiry, notifies the business and acknowledges the customer", async () => {
    const email = new FakeEmailSender();
    const result = await submitEnquiry({ payload: payload(), source: "WEBSITE_FORM", idempotencyKey: key() }, deps(email));

    expect(result.referenceNumber).toMatch(REFERENCE_PATTERN);
    expect(result).toMatchObject({ duplicate: false, notification: "sent" });
    const row = await db.enquiry.findUniqueOrThrow({ where: { referenceNumber: result.referenceNumber } });
    expect(row).toMatchObject({
      enquiryType: "QUOTE",
      fullName: "Ravi Kumar",
      companyName: "Example Industries",
      serviceRequired: "fire-alarm-systems",
      consentGiven: true,
      emailStatus: "SENT",
      emailAttempts: 1,
      status: "NEW",
    });
    expect(row.acknowledgementSentAt).not.toBeNull();
    expect(email.sent).toHaveLength(2);
    expect(email.sent[0]!.to).toEqual(["sales@example.com"]);
    expect(email.sent[0]!.replyTo).toBe("ravi@example.com");
    expect(email.sent[1]!.to).toEqual(["ravi@example.com"]);
  });

  it("keeps the enquiry when email delivery fails, and the retry job recovers it", async () => {
    const email = new FakeEmailSender();
    email.fail = true;
    const result = await submitEnquiry({ payload: payload(), source: "WEBSITE_FORM", idempotencyKey: key() }, deps(email));
    expect(result.notification).toBe("queued");

    let row = await db.enquiry.findUniqueOrThrow({ where: { referenceNumber: result.referenceNumber } });
    expect(row.emailStatus).toBe("FAILED");
    expect(row.emailAttempts).toBe(1);
    expect(row.emailLastError).toContain("simulated provider outage");

    // Provider recovers; run the job "later" than the backoff window.
    email.fail = false;
    const later = () => new Date(Date.now() + 10 * 60_000);
    const summary = await retryPendingNotifications(deps(email, { now: later }));
    expect(summary).toMatchObject({ attempted: 1, sent: 1, failed: 0 });
    row = await db.enquiry.findUniqueOrThrow({ where: { referenceNumber: result.referenceNumber } });
    expect(row.emailStatus).toBe("SENT");
    expect(row.emailAttempts).toBe(2);
  });

  it("does not retry within the backoff window or beyond the attempt limit", async () => {
    const email = new FakeEmailSender();
    email.fail = true;
    await submitEnquiry({ payload: payload(), source: "WEBSITE_FORM", idempotencyKey: key() }, deps(email));
    expect((await retryPendingNotifications(deps(email))).attempted).toBe(0);
    await db.enquiry.updateMany({ data: { emailAttempts: 6 } });
    expect((await retryPendingNotifications(deps(email, { now: () => new Date(Date.now() + 3_600_000) }))).attempted).toBe(0);
  });

  it("saves enquiries while email is not configured and sends them once it is", async () => {
    const result = await submitEnquiry({ payload: payload(), source: "WEBSITE_FORM", idempotencyKey: key() }, deps(new FakeEmailSender(false)));
    expect(result.notification).toBe("queued");
    expect((await db.enquiry.findFirstOrThrow()).emailStatus).toBe("NOT_CONFIGURED");
    const email = new FakeEmailSender(true);
    const summary = await retryPendingNotifications(deps(email, { now: () => new Date(Date.now() + 10 * 60_000) }));
    expect(summary.sent).toBe(1);
  });

  it("treats a resubmission with the same idempotency key as the same enquiry", async () => {
    const k = key();
    const email = new FakeEmailSender();
    const first = await submitEnquiry({ payload: payload(), source: "WEBSITE_FORM", idempotencyKey: k }, deps(email));
    const second = await submitEnquiry({ payload: payload(), source: "WEBSITE_FORM", idempotencyKey: k }, deps(email));
    expect(second).toMatchObject({ referenceNumber: first.referenceNumber, duplicate: true });
    expect(await db.enquiry.count()).toBe(1);
    expect(email.sent).toHaveLength(2); // one notification + one acknowledgement, not four
  });

  it("handles concurrent duplicate submissions without creating two records", async () => {
    const k = key();
    const results = await Promise.all(
      Array.from({ length: 4 }, () => submitEnquiry({ payload: payload(), source: "WEBSITE_FORM", idempotencyKey: k }, deps())),
    );
    expect(new Set(results.map((r) => r.referenceNumber)).size).toBe(1);
    expect(await db.enquiry.count()).toBe(1);
  });

  it("records chatbot leads in the same table with their source", async () => {
    const result = await submitEnquiry(
      { payload: payload({ enquiryType: "CALLBACK", message: "Call me about AMC", companyName: undefined, siteLocation: undefined, serviceRequired: undefined }), source: "CHATBOT", idempotencyKey: key() },
      deps(),
    );
    const row = await db.enquiry.findUniqueOrThrow({ where: { referenceNumber: result.referenceNumber } });
    expect(row).toMatchObject({ enquiryType: "CALLBACK", source: "CHATBOT" });
  });

  it("stores attachment metadata and removes the object if saving fails", async () => {
    const storage = new FakeStorage();
    const file = validateAttachment(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]), "plan.pdf");
    if (!file.ok) throw new Error("fixture invalid");
    const result = await submitEnquiry({ payload: payload(), source: "WEBSITE_FORM", idempotencyKey: key(), attachment: file.file }, deps(new FakeEmailSender(), { storage }));
    const row = await db.enquiry.findUniqueOrThrow({ where: { referenceNumber: result.referenceNumber }, include: { attachments: true } });
    expect(row.attachments[0]).toMatchObject({ originalName: "plan.pdf", contentType: "application/pdf", sizeBytes: 6 });
    expect(row.attachments[0]!.storageKey).toMatch(/^enquiries\//);

    // The insert fails after the upload: the uploaded object must be removed, not orphaned.
    const failingInsert = new Proxy(db, {
      get(target, prop, receiver) {
        if (prop !== "enquiry") return Reflect.get(target, prop, receiver);
        return new Proxy(target.enquiry, {
          get(model, p, r) {
            if (p === "create") return async () => Promise.reject(new Error("insert failed"));
            return Reflect.get(model, p, r);
          },
        });
      },
    });
    const before = storage.stored.size;
    await expect(
      submitEnquiry({ payload: payload(), source: "WEBSITE_FORM", idempotencyKey: key(), attachment: file.file }, { ...deps(new FakeEmailSender(), { storage }), db: failingInsert }),
    ).rejects.toThrow("insert failed");
    expect(storage.removed).toHaveLength(1);
    expect(storage.stored.size).toBe(before);
  });

  it("applies the retention policy only to expired enquiries", async () => {
    await submitEnquiry({ payload: payload(), source: "WEBSITE_FORM", idempotencyKey: key() }, deps());
    const old = await submitEnquiry({ payload: payload(), source: "WEBSITE_FORM", idempotencyKey: key() }, deps());
    await db.enquiry.update({ where: { referenceNumber: old.referenceNumber }, data: { createdAt: new Date(Date.now() - 800 * 86_400_000) } });
    const r = await purgeExpiredEnquiries({ db }, 730);
    expect(r.deleted).toBe(1);
    expect(await db.enquiry.count()).toBe(1);
    expect(await db.enquiry.findUnique({ where: { referenceNumber: old.referenceNumber } })).toBeNull();
  });
});

describe("POST /api/v1/enquiries end-to-end with PostgreSQL", () => {
  const url = "http://localhost:3000/api/v1/enquiries";
  const handlerDeps = (email = new FakeEmailSender()) => ({
    service: () => deps(email),
    rateLimitStore: () => new PostgresRateLimitStore(db),
    verifySpam: async (token: string | undefined) => (token === "valid-token" ? ({ ok: true } as const) : ({ ok: false, reason: "invalid-token" } as const)),
    rateLimitSalt: "salt",
    attachmentsEnabled: false,
  });

  it("returns 201 with a reference number and stores the enquiry", async () => {
    const res = await handleEnquiryRequest(jsonRequest(url, { ...validQuote, idempotencyKey: key(), turnstileToken: "valid-token" }), handlerDeps());
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(Object.keys(json.data).sort()).toEqual(["duplicate", "notification", "referenceNumber"]);
    expect(await db.enquiry.count({ where: { referenceNumber: json.data.referenceNumber } })).toBe(1);
  });

  it("does not save anything when the spam token is rejected", async () => {
    const res = await handleEnquiryRequest(jsonRequest(url, { ...validQuote, idempotencyKey: key(), turnstileToken: "forged" }), handlerDeps());
    expect(res.status).toBe(400);
    expect(await db.enquiry.count()).toBe(0);
  });

  it("returns a generic 500 when the database is unreachable", async () => {
    const broken = createPrismaClient("postgresql://nobody:supersecretpw@localhost:5444/does_not_exist");
    const res = await handleEnquiryRequest(jsonRequest(url, { ...validQuote, idempotencyKey: key(), turnstileToken: "valid-token" }), {
      ...handlerDeps(),
      service: () => ({ ...deps(), db: broken }),
    });
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).not.toMatch(/supersecretpw|does_not_exist|nobody|prisma/i);
    await broken.$disconnect();
  });
});

describe("shared-store rate limiting", () => {
  it("counts hits across separate application instances", async () => {
    // Two clients = two connection pools, as on two servers.
    const instanceA = new PostgresRateLimitStore(db);
    const otherClient = createPrismaClient(process.env.TEST_DATABASE_URL!);
    const instanceB = new PostgresRateLimitStore(otherClient);
    const rules = [{ name: "itest", limit: 5, windowMs: 60_000 }];
    const results = [];
    for (let i = 0; i < 6; i++) results.push((await checkRateLimits(i % 2 === 0 ? instanceA : instanceB, "client-1", rules)).allowed);
    expect(results).toEqual([true, true, true, true, true, false]);
    await otherClient.$disconnect();
  });

  it("is atomic under concurrent requests", async () => {
    const store = new PostgresRateLimitStore(db);
    const counts = await Promise.all(Array.from({ length: 25 }, () => store.hit("burst", 60_000).then((r) => r.count)));
    expect(counts.sort((a, b) => a - b)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  });

  it("resets the window after expiry and purges old buckets", async () => {
    const store = new PostgresRateLimitStore(db);
    await store.hit("short", 1);
    await new Promise((r) => setTimeout(r, 20));
    expect((await store.hit("short", 60_000)).count).toBe(1);
    await db.rateLimitBucket.create({ data: { key: "ancient", count: 3, expiresAt: new Date(Date.now() - 2 * 3_600_000) } });
    expect(await store.purgeExpired()).toBeGreaterThanOrEqual(1);
    expect(await db.rateLimitBucket.findUnique({ where: { key: "ancient" } })).toBeNull();
  });
});
