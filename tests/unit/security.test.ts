import { describe, expect, it, vi } from "vitest";
import { isTurnstileTestSecret, verifyTurnstileToken } from "@/lib/security/spam-protection";
import { checkRateLimits, MemoryRateLimitStore } from "@/lib/security/rate-limit";
import { clientIp, hashIdentifier, isAllowedOrigin, PayloadTooLargeError, readBodyWithLimit } from "@/lib/security/request";
import { sanitiseFileName, validateAttachment } from "@/lib/storage/attachments";
import { escapeHtml, renderAcknowledgementEmail, renderNotificationEmail, type EnquiryEmailData } from "@/lib/email/templates";
import { safeReplyTo } from "@/lib/email/email-service";

describe("Turnstile verification (server side)", () => {
  const ok = () => new Response(JSON.stringify({ success: true }), { status: 200 });

  it("posts the secret and token to Cloudflare and accepts a valid token", async () => {
    const fetchImpl = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () => ok());
    const r = await verifyTurnstileToken("tok", "198.51.100.1", { secretKey: "sekret", isProduction: true, fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(r).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(String(url)).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const body = init?.body as URLSearchParams;
    expect(body.get("secret")).toBe("sekret");
    expect(body.get("response")).toBe("tok");
    expect(body.get("remoteip")).toBe("198.51.100.1");
  });

  it("rejects a token Cloudflare marks invalid", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] })));
    const r = await verifyTurnstileToken("bad", undefined, { secretKey: "s", isProduction: true, fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(r).toEqual({ ok: false, reason: "invalid-token" });
  });

  it("rejects a missing token without calling Cloudflare", async () => {
    const fetchImpl = vi.fn();
    const r = await verifyTurnstileToken(undefined, undefined, { secretKey: "s", isProduction: true, fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(r).toEqual({ ok: false, reason: "missing-token" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fails closed in production when no secret is configured", async () => {
    const r = await verifyTurnstileToken("tok", undefined, { secretKey: undefined, isProduction: true });
    expect(r).toEqual({ ok: false, reason: "not-configured" });
  });

  it("skips only in development when no secret is configured", async () => {
    const r = await verifyTurnstileToken(undefined, undefined, { secretKey: undefined, isProduction: false });
    expect(r).toEqual({ ok: true, skipped: true });
  });

  it("refuses Cloudflare's always-pass test secret in production", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ success: true })));
    const testSecret = "1x0000000000000000000000000000000AA";
    const r = await verifyTurnstileToken("tok", undefined, { secretKey: testSecret, isProduction: true, fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(r).toEqual({ ok: false, reason: "not-configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
    // Allowed in development, and only by explicit opt-in for automated tests.
    expect((await verifyTurnstileToken("tok", undefined, { secretKey: testSecret, isProduction: false, fetchImpl: fetchImpl as unknown as typeof fetch })).ok).toBe(true);
    expect((await verifyTurnstileToken("tok", undefined, { secretKey: testSecret, isProduction: true, allowTestKeys: true, fetchImpl: fetchImpl as unknown as typeof fetch })).ok).toBe(true);
  });

  it("recognises all published Turnstile test secrets but not real ones", () => {
    for (const s of ["1x0000000000000000000000000000000AA", "2x0000000000000000000000000000000AA", "3x0000000000000000000000000000000AA"]) expect(isTurnstileTestSecret(s)).toBe(true);
    expect(isTurnstileTestSecret("0x4AAAAAAABkMYinukE8nzYS_real_secret")).toBe(false);
    expect(isTurnstileTestSecret(undefined)).toBe(false);
  });

  it("treats network failures as unavailable, not as success", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    const r = await verifyTurnstileToken("tok", undefined, { secretKey: "s", isProduction: true, fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(r).toEqual({ ok: false, reason: "verification-unavailable" });
  });
});

describe("rate limiting", () => {
  it("allows up to the limit and then blocks with a retry time", async () => {
    let t = 0;
    const store = new MemoryRateLimitStore(() => t);
    const rules = [{ name: "r", limit: 3, windowMs: 60_000 }];
    for (let i = 0; i < 3; i++) expect((await checkRateLimits(store, "ip", rules, () => t)).allowed).toBe(true);
    const blocked = await checkRateLimits(store, "ip", rules, () => t);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    t = 61_000;
    expect((await checkRateLimits(store, "ip", rules, () => t)).allowed).toBe(true);
  });

  it("tracks identifiers independently", async () => {
    const store = new MemoryRateLimitStore();
    const rules = [{ name: "r", limit: 1, windowMs: 60_000 }];
    expect((await checkRateLimits(store, "a", rules)).allowed).toBe(true);
    expect((await checkRateLimits(store, "b", rules)).allowed).toBe(true);
    expect((await checkRateLimits(store, "a", rules)).allowed).toBe(false);
  });
});

describe("request helpers", () => {
  it("enforces body limits even without Content-Length", async () => {
    const stream = new ReadableStream({
      start(c) {
        c.enqueue(new Uint8Array(600));
        c.enqueue(new Uint8Array(600));
        c.close();
      },
    });
    const req = new Request("http://x/api", { method: "POST", body: stream, duplex: "half" } as RequestInit);
    await expect(readBodyWithLimit(req, 1000)).rejects.toBeInstanceOf(PayloadTooLargeError);
  });

  it("rejects declared oversize bodies immediately", async () => {
    const req = new Request("http://x/api", { method: "POST", headers: { "content-length": "999999" }, body: "x" });
    await expect(readBodyWithLimit(req, 1000)).rejects.toBeInstanceOf(PayloadTooLargeError);
  });

  it("hashes IP identifiers and never returns the raw IP", () => {
    const h = hashIdentifier("203.0.113.5", "salt");
    expect(h).not.toContain("203.0.113.5");
    expect(h).toHaveLength(40);
    expect(hashIdentifier("203.0.113.5", "other")).not.toBe(h);
  });

  it("reads the client IP from proxy headers", () => {
    expect(clientIp(new Request("http://x", { headers: { "x-forwarded-for": "198.51.100.7, 10.0.0.1" } }))).toBe("198.51.100.7");
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });

  it("rejects cross-site browser origins", () => {
    const req = (origin?: string) => new Request("http://localhost:3000/api", { headers: origin ? { origin } : {} });
    expect(isAllowedOrigin(req("http://localhost:3000"), "http://localhost:3000")).toBe(true);
    expect(isAllowedOrigin(req(), "http://localhost:3000")).toBe(true);
    expect(isAllowedOrigin(req("https://evil.example"), "http://localhost:3000")).toBe(false);
  });
});

describe("attachments", () => {
  const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
  it("accepts files by signature", () => {
    const r = validateAttachment(pdf, "drawing.pdf");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.file.contentType).toBe("application/pdf");
  });
  it("rejects executables disguised with a PDF name", () => {
    const exe = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03]);
    expect(validateAttachment(exe, "invoice.pdf").ok).toBe(false);
  });
  it("rejects oversize and empty files", () => {
    expect(validateAttachment(new Uint8Array(0), "a.pdf").ok).toBe(false);
    const big = new Uint8Array(4 * 1024 * 1024 + 1);
    big.set(pdf);
    expect(validateAttachment(big, "a.pdf").ok).toBe(false);
  });
  it("sanitises file names", () => {
    expect(sanitiseFileName("../../etc/<script>pass wd.pdf")).toBe("scriptpass wd.pdf");
  });
});

describe("email templates", () => {
  const data: EnquiryEmailData = {
    referenceNumber: "SB-261015-ABCDE",
    enquiryType: "QUOTE",
    source: "CHATBOT",
    fullName: "<script>alert(1)</script>",
    email: "a@b.co",
    phone: "+91 98765 43210",
    companyName: "Evil\r\nBcc: victim@example.com",
    jobRole: null,
    siteLocation: "Vizag",
    serviceRequired: "fire-alarm-systems",
    message: "<img src=x onerror=alert(1)>",
    approximateScope: null,
    systemType: null,
    equipmentQuantity: null,
    currentMaintenance: null,
    preferredContactMethod: null,
    productSlug: null,
    attachmentCount: 0,
    createdAt: new Date("2026-10-15T00:00:00Z"),
  };

  it("escapes all user-supplied HTML", () => {
    const { html } = renderNotificationEmail(data);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain(escapeHtml("<script>alert(1)</script>"));
  });

  it("prevents header injection in the subject", () => {
    const { subject } = renderNotificationEmail(data);
    expect(subject).not.toMatch(/[\r\n]/);
    expect(subject).toContain("Chatbot lead");
  });

  it("acknowledgements do not promise prices or timelines", () => {
    const { text } = renderAcknowledgementEmail(data);
    expect(text).toContain("SB-261015-ABCDE");
    expect(text).toContain("not a quotation");
    expect(text).not.toMatch(/within \d+ (hours|days)/i);
  });

  it("shows readable service and product names in the notification", () => {
    const { text } = renderNotificationEmail({ ...data, productSlug: "co2-extinguisher" });
    expect(text).toContain("Service required: Fire Alarm Systems");
    expect(text).toContain("Product: CO₂ Fire Extinguisher");
  });

  it("never uses a display-name reply-to supplied by the public", () => {
    expect(safeReplyTo("a@b.co")).toBe("a@b.co");
    expect(safeReplyTo('"CEO" <ceo@corp.com>, x@y.z')).toBeUndefined();
  });
});
