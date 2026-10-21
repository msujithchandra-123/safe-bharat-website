import { after } from "next/server";
import { serverEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { retryAfterSubmission } from "@/lib/enquiries/automatic-retry";
import { handleEnquiryRequest } from "@/lib/enquiries/handle-enquiry-request";
import { attachmentsEnabled, enquiryDeps, rateLimitStore } from "@/lib/runtime";
import { verifyTurnstileToken } from "@/lib/security/spam-protection";

export async function POST(request: Request): Promise<Response> {
  const response = await handleEnquiryRequest(request, {
    service: enquiryDeps,
    rateLimitStore,
    verifySpam: (token, ip) =>
      verifyTurnstileToken(token, ip, { ...serverEnv.turnstile(), isProduction: serverEnv.isProduction() }),
    rateLimitSalt: serverEnv.rateLimitSalt(),
    attachmentsEnabled: attachmentsEnabled(),
  });

  // Opportunistic recovery: after a successful submission, retry a few older
  // notifications that previously failed (unless EMAIL_AUTO_RETRY=false).
  // The scheduled job covers quiet periods.
  if (response.status === 201) {
    after(async () => {
      try {
        await retryAfterSubmission(enquiryDeps(), serverEnv.emailAutoRetry());
      } catch (error) {
        logger.warn("enquiry.background_retry_failed", { errorName: error instanceof Error ? error.name : "unknown" });
      }
    });
  }
  return response;
}
