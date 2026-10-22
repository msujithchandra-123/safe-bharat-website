import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createPrismaClient } from "@/lib/db";
import { retryAfterSubmission, runMaintenance } from "@/lib/enquiries/automatic-retry";
import type { EnquiryServiceDeps } from "@/lib/enquiries/enquiry-service";
import { PostgresRateLimitStore } from "@/lib/security/rate-limit";
import { siteConfig } from "@/config/site";
import { FakeEmailSender } from "../support/fakes";

// Test database only (enforced by tests/support/setup-integration.ts). The email
// sender is always a fake, so no test here can reach the SMTP server.
const db = createPrismaClient(process.env.TEST_DATABASE_URL!);
let n = 0;

/** A saved enquiry whose notification failed an hour ago: eligible for retry when retries are on. */
async function seedFailedNotification() {
  n++;
  const lastAttempt = new Date(Date.now() - 60 * 60_000);
  return db.enquiry.create({
    data: {
      referenceNumber: `SB-TEST-RP${String(n).padStart(3, "0")}`,
      idempotencyKey: `retry-pause-test-${Date.now()}-${n}`,
      enquiryType: "QUOTE",
      fullName: "Retry Pause Test",
      email: "retry-pause@example.com",
      phone: "+91 98765 43210",
      message: "Synthetic enquiry for the retry-pause test.",
      consentGiven: true,
      consentAt: new Date(),
      privacyNoticeVersion: siteConfig.privacyNoticeVersion,
      emailStatus: "FAILED",
      emailAttempts: 1,
      emailLastError: "validation_error: simulated",
      emailLastAttemptAt: lastAttempt,
      createdAt: new Date(Date.now() - 2 * 60 * 60_000),
    },
  });
}

const snapshot = (id: string) =>
  db.enquiry.findUniqueOrThrow({
    where: { id },
    select: { emailStatus: true, emailAttempts: true, emailLastAttemptAt: true, emailLastError: true, emailSentAt: true, acknowledgementSentAt: true },
  });

function deps(email: FakeEmailSender): EnquiryServiceDeps {
  return { db, email, notificationRecipients: ["sales@example.com"], sendAcknowledgement: true };
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

describe("EMAIL_AUTO_RETRY=false pauses automatic resends", () => {
  it("background retry after a new submission sends nothing and leaves failed notifications untouched", async () => {
    const failed = [await seedFailedNotification(), await seedFailedNotification(), await seedFailedNotification()];
    const before = await Promise.all(failed.map((f) => snapshot(f.id)));
    const email = new FakeEmailSender();

    const result = await retryAfterSubmission(deps(email), false);

    expect(result).toMatchObject({ attempted: 0, sent: 0, skipped: "auto-retry-paused" });
    expect(email.sent).toHaveLength(0);
    expect(await Promise.all(failed.map((f) => snapshot(f.id)))).toEqual(before);
  });

  it("scheduled maintenance sends nothing and leaves failed notifications untouched, but still runs its other tasks", async () => {
    const failed = await seedFailedNotification();
    const before = await snapshot(failed.id);
    await db.rateLimitBucket.create({ data: { key: "expired-bucket", count: 1, expiresAt: new Date(Date.now() - 2 * 60 * 60_000) } });
    const email = new FakeEmailSender();

    const result = await runMaintenance({ enquiry: deps(email), rateLimitStore: new PostgresRateLimitStore(db), retentionDays: 730, autoRetry: false });

    expect(result.notifications).toMatchObject({ attempted: 0, sent: 0, skipped: "auto-retry-paused" });
    expect(email.sent).toHaveLength(0);
    expect(await snapshot(failed.id)).toEqual(before);
    // Retention and rate-limit cleanup are unaffected by the pause.
    expect(result.purgedRateLimitBuckets).toBe(1);
  });
});

describe("retries stay enabled by default (positive controls)", () => {
  it("background retry resends a failed notification when enabled", async () => {
    const failed = await seedFailedNotification();
    const email = new FakeEmailSender();

    const result = await retryAfterSubmission(deps(email), true);

    expect(result).toMatchObject({ attempted: 1, sent: 1 });
    expect(email.sent.map((m) => m.to[0])).toContain("sales@example.com");
    expect((await snapshot(failed.id)).emailStatus).toBe("SENT");
  });

  it("scheduled maintenance resends a failed notification when enabled", async () => {
    const failed = await seedFailedNotification();
    const email = new FakeEmailSender();

    const result = await runMaintenance({ enquiry: deps(email), rateLimitStore: new PostgresRateLimitStore(db), retentionDays: 730, autoRetry: true });

    expect(result.notifications).toMatchObject({ attempted: 1, sent: 1 });
    expect((await snapshot(failed.id)).emailStatus).toBe("SENT");
  });
});
