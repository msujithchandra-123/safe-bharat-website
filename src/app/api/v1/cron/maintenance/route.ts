import { timingSafeEqual } from "node:crypto";
import { connection } from "next/server";
import { errors, ok } from "@/lib/api/response";
import { serverEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { runMaintenance } from "@/lib/enquiries/automatic-retry";
import { enquiryDeps, rateLimitStore } from "@/lib/runtime";

/**
 * Scheduled maintenance: retries failed enquiry notifications, applies the
 * data-retention policy and purges expired rate-limit buckets. Protected by CRON_SECRET (Vercel Cron sends it
 * as a Bearer token). Not a public or admin endpoint: it returns counts only.
 */
function authorised(request: Request): boolean {
  const secret = serverEnv.cronSecret();
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function GET(request: Request): Promise<Response> {
  await connection();
  if (!authorised(request)) return errors.unauthorized();
  try {
    const { notifications, retention, purgedRateLimitBuckets } = await runMaintenance({
      enquiry: enquiryDeps(),
      rateLimitStore: rateLimitStore(),
      retentionDays: serverEnv.retentionDays(),
      autoRetry: serverEnv.emailAutoRetry(),
    });
    logger.info("cron.maintenance", { ...notifications, retentionDeleted: retention.deleted, purgedRateLimitBuckets });
    return ok({ notifications, retention, purgedRateLimitBuckets });
  } catch (error) {
    logger.error("cron.maintenance_failed", { errorName: error instanceof Error ? error.name : "unknown" });
    return errors.internal();
  }
}
