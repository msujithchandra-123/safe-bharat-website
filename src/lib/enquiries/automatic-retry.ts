import { logger } from "@/lib/logger";
import { purgeExpiredEnquiries, retryPendingNotifications, type EnquiryServiceDeps } from "@/lib/enquiries/enquiry-service";

/**
 * The two places that resend failed notifications automatically:
 *   - after a new enquiry is submitted (background, a few older failures), and
 *   - the scheduled maintenance job.
 * Both honour EMAIL_AUTO_RETRY. When it is "false", failed notifications are left
 * exactly as they are (status, attempt count and timestamps unchanged) until the
 * setting is removed or set back to "true".
 */
const PAUSED = { attempted: 0, sent: 0, failed: 0, skipped: "auto-retry-paused" } as const;

export async function retryAfterSubmission(deps: EnquiryServiceDeps, autoRetry: boolean) {
  if (!autoRetry) {
    logger.info("enquiry.auto_retry_paused", { route: "enquiries" });
    return PAUSED;
  }
  return retryPendingNotifications(deps, { batchSize: 3 });
}

export interface MaintenanceDeps {
  enquiry: EnquiryServiceDeps;
  rateLimitStore: { purgeExpired(): Promise<number> };
  retentionDays: number;
  autoRetry: boolean;
}

/** Scheduled maintenance. Retention and rate-limit cleanup always run; retries only when enabled. */
export async function runMaintenance(deps: MaintenanceDeps) {
  let notifications;
  if (deps.autoRetry) {
    notifications = await retryPendingNotifications(deps.enquiry);
  } else {
    logger.info("enquiry.auto_retry_paused", { route: "cron" });
    notifications = PAUSED;
  }
  const retention = await purgeExpiredEnquiries(deps.enquiry, deps.retentionDays);
  const purgedRateLimitBuckets = await deps.rateLimitStore.purgeExpired();
  return { notifications, retention, purgedRateLimitBuckets };
}
