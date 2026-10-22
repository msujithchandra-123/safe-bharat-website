/**
 * Manual, opt-in live test of the SMTP integration. It is NOT part of `npm test`
 * or `npm run test:integration`, and it is skipped entirely unless
 * LIVE_EMAIL_TEST_TO is set.
 *
 *   Check only (sends nothing):
 *     $env:LIVE_EMAIL_TEST_TO="you@example.com"; npm run email:test
 *   Send exactly one test email:
 *     $env:LIVE_EMAIL_TEST_TO="you@example.com"; $env:LIVE_EMAIL_TEST_SEND="yes"; npm run email:test
 *
 * It uses the website's real email code (SmtpEmailSender and the notification
 * template) with clearly synthetic sample data. The recipient is passed directly,
 * so ENQUIRY_NOTIFICATION_TO is never changed. No enquiry is created and the
 * database is not touched. The SMTP password is never printed.
 */
import dotenv from "dotenv";
import { describe, expect, it } from "vitest";
import { SmtpEmailSender } from "@/lib/email/email-service";
import { renderNotificationEmail, type EnquiryEmailData } from "@/lib/email/templates";
import { serverEnv } from "@/lib/env";

dotenv.config({ path: [".env.local", ".env"], quiet: true });

const to = process.env.LIVE_EMAIL_TEST_TO?.trim();
const send = process.env.LIVE_EMAIL_TEST_SEND === "yes";

const sample: EnquiryEmailData = {
  referenceNumber: "SB-TEST-LIVE",
  enquiryType: "QUOTE",
  source: "WEBSITE_FORM",
  fullName: "Website email test (not a real customer)",
  email: "test-sample@example.com",
  phone: "+91 00000 00000",
  companyName: "Safe Bharat email test",
  jobRole: null,
  siteLocation: "Test only",
  serviceRequired: "fire-alarm-systems",
  message: "This is a controlled test of the Safe Bharat website notification email. No enquiry was submitted and no customer is involved.",
  approximateScope: null,
  systemType: null,
  equipmentQuantity: null,
  currentMaintenance: null,
  preferredContactMethod: null,
  productSlug: null,
  attachmentCount: 0,
  createdAt: new Date(),
};

describe.skipIf(!to)("live SMTP test email (manual, opt-in)", () => {
  it("checks the configuration without sending", () => {
    const cfg = serverEnv.email();
    console.log(
      [
        "SMTP configuration (password not shown):",
        `  SMTP_HOST: ${cfg.host}:${cfg.port}`,
        `  SMTP_USER: ${cfg.user ?? "missing"}`,
        `  SMTP_PASSWORD: ${cfg.password ? "set" : "missing"}`,
        `  EMAIL_FROM: ${cfg.from ?? "missing"}`,
        `  ENQUIRY_NOTIFICATION_TO (unchanged by this test): ${cfg.to.join(", ") || "missing"}`,
        `  Test recipient for this run only: ${to}`,
        `  Will send: ${send ? "YES - exactly one email" : "no (set LIVE_EMAIL_TEST_SEND=yes to send)"}`,
      ].join("\n"),
    );
    expect(cfg.user, "SMTP_USER is missing").toBeTruthy();
    expect(cfg.password, "SMTP_PASSWORD is missing").toBeTruthy();
    expect(cfg.from, "EMAIL_FROM is missing").toBeTruthy();
    expect(to).toMatch(/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/);
  });

  it.skipIf(!send)(
    "sends exactly one test email to LIVE_EMAIL_TEST_TO",
    async () => {
      const cfg = serverEnv.email();
      const rendered = renderNotificationEmail(sample);
      const result = await new SmtpEmailSender({ host: cfg.host, port: cfg.port, user: cfg.user!, password: cfg.password!, from: cfg.from! }).send({
        ...rendered,
        subject: `[TEST] ${rendered.subject}`,
        to: [to!],
        // A unique key per run: re-running sends a new test only when you run it again on purpose.
        idempotencyKey: `live-email-test-${Date.now()}`,
      });
      console.log(result.ok ? `Sent. SMTP message id: ${result.providerId}` : `Not sent. SMTP server said: ${result.error}`);
      expect(result.ok).toBe(true);
    },
    20_000,
  );
});
