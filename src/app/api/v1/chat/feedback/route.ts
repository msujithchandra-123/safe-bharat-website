import { z } from "zod";
import { siteConfig } from "@/config/site";
import { errors, ok } from "@/lib/api/response";
import { serverEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { rateLimitStore } from "@/lib/runtime";
import { checkRateLimits } from "@/lib/security/rate-limit";
import { clientIp, hashIdentifier, isAllowedOrigin, readJsonWithLimit } from "@/lib/security/request";

const schema = z.object({ rating: z.enum(["up", "down"]), kind: z.enum(["answer", "emergency"]) });

/** Records anonymous helpfulness ratings as operational metadata. No message content is accepted. */
export async function POST(request: Request): Promise<Response> {
  if (!isAllowedOrigin(request, siteConfig.url)) return errors.unauthorized();
  let body: unknown;
  try {
    body = await readJsonWithLimit(request, 512);
  } catch {
    return errors.validation({ form: "Invalid request." });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return errors.validation({ form: "Invalid request." });
  try {
    const limit = await checkRateLimits(rateLimitStore(), hashIdentifier(clientIp(request), serverEnv.rateLimitSalt()), [
      { name: "chat-feedback-10m", limit: 30, windowMs: 10 * 60_000 },
    ]);
    if (!limit.allowed) return errors.rateLimited(limit.retryAfterSeconds);
  } catch {
    return errors.unavailable();
  }
  logger.info("chat.feedback", parsed.data);
  return ok({ recorded: true });
}
