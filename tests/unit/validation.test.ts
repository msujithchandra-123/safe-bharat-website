import { describe, expect, it } from "vitest";
import { enquiryEnvelopeSchema, enquiryPayloadSchema, normaliseText } from "@/lib/validation/enquiry";
import { generateReferenceNumber, REFERENCE_PATTERN } from "@/lib/enquiries/reference";
import { validQuote } from "../support/fakes";

describe("enquiry validation", () => {
  it("accepts a complete quote request and normalises the email", () => {
    const r = enquiryPayloadSchema.safeParse({ ...validQuote, email: "  Ravi@Example.COM " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("ravi@example.com");
  });

  it("rejects missing required fields per enquiry type", () => {
    const r = enquiryPayloadSchema.safeParse({ ...validQuote, companyName: "", siteLocation: undefined });
    expect(r.success).toBe(false);
    const paths = r.success ? [] : r.error.issues.map((i) => i.path.join("."));
    expect(paths).toEqual(expect.arrayContaining(["companyName", "siteLocation"]));
  });

  it("rejects invalid email and phone values", () => {
    const r = enquiryPayloadSchema.safeParse({ ...validQuote, email: "not-an-email", phone: "12" });
    expect(r.success).toBe(false);
    const paths = r.success ? [] : r.error.issues.map((i) => i.path.join("."));
    expect(paths).toEqual(expect.arrayContaining(["email", "phone"]));
  });

  it("requires explicit consent", () => {
    expect(enquiryPayloadSchema.safeParse({ ...validQuote, consent: false }).success).toBe(false);
    expect(enquiryPayloadSchema.safeParse({ ...validQuote, consent: "true" }).success).toBe(false);
  });

  it("only accepts known service and product slugs", () => {
    expect(enquiryPayloadSchema.safeParse({ ...validQuote, serviceRequired: "nuclear-reactors" }).success).toBe(false);
    expect(enquiryPayloadSchema.safeParse({ ...validQuote, serviceRequired: "other" }).success).toBe(true);
    const equipment = { enquiryType: "EQUIPMENT", fullName: "A B", email: "a@b.co", phone: "+91 98765 43210", message: "Need 10", consent: true };
    expect(enquiryPayloadSchema.safeParse({ ...equipment, productSlug: "co2-extinguisher" }).success).toBe(true);
    expect(enquiryPayloadSchema.safeParse({ ...equipment, productSlug: "../../etc/passwd" }).success).toBe(false);
  });

  it("enforces length limits", () => {
    expect(enquiryPayloadSchema.safeParse({ ...validQuote, message: "x".repeat(4001) }).success).toBe(false);
  });

  it("rejects unknown enquiry types", () => {
    expect(enquiryPayloadSchema.safeParse({ ...validQuote, enquiryType: "ADMIN" }).success).toBe(false);
  });

  it("strips control and bidi characters", () => {
    expect(normaliseText("  Hello\u0000‮ World \r\n")).toBe("Hello World");
  });

  it("validates the idempotency key format", () => {
    expect(enquiryEnvelopeSchema.safeParse({ idempotencyKey: "abcdefghijklmnop" }).success).toBe(true);
    expect(enquiryEnvelopeSchema.safeParse({ idempotencyKey: "short" }).success).toBe(false);
    expect(enquiryEnvelopeSchema.safeParse({ idempotencyKey: "a'; DROP TABLE x;--aaaaaa" }).success).toBe(false);
  });
});

describe("reference numbers", () => {
  it("use the SB-YYMMDD-XXXXX format in IST", () => {
    const ref = generateReferenceNumber(new Date("2026-10-15T20:00:00Z"));
    expect(ref).toMatch(REFERENCE_PATTERN);
    expect(ref.startsWith("SB-261016-")).toBe(true);
  });

  it("are not trivially repeated", () => {
    const refs = new Set(Array.from({ length: 200 }, () => generateReferenceNumber()));
    expect(refs.size).toBeGreaterThan(195);
  });
});
