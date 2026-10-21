import { siteConfig } from "@/config/site";
import { errors, fail, ok } from "@/lib/api/response";
import { logger } from "@/lib/logger";
import { ChatUnavailableError, emergencyReply, generateChatReply, type ChatServiceDeps } from "@/lib/ai/chat-service";
import { isEmergencyMessage } from "@/lib/ai/emergency";
import { chatRequestSchema } from "@/lib/ai/types";
import { checkRateLimits, RATE_LIMITS, type RateLimitStore } from "@/lib/security/rate-limit";
import { clientIp, hashIdentifier, isAllowedOrigin, PayloadTooLargeError, readJsonWithLimit } from "@/lib/security/request";
import { fieldErrors } from "@/lib/validation/enquiry";

export const CHAT_BODY_LIMIT = 24 * 1024;

export interface ChatHandlerDeps {
  chat: () => ChatServiceDeps;
  rateLimitStore: () => RateLimitStore;
  rateLimitSalt: string;
}

const UNAVAILABLE_MESSAGE = `The assistant is not available right now. Please call ${siteConfig.contact.phones[0].display} or email ${siteConfig.contact.email}.`;

/** POST /api/v1/chat. Conversations are not stored; only operational metadata is logged. */
export async function handleChatRequest(request: Request, deps: ChatHandlerDeps): Promise<Response> {
  if (!isAllowedOrigin(request, siteConfig.url)) return errors.unauthorized();
  if (!(request.headers.get("content-type") ?? "").startsWith("application/json")) return errors.unsupported();

  let body: unknown;
  try {
    body = await readJsonWithLimit(request, CHAT_BODY_LIMIT);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) return errors.tooLarge();
    return errors.validation({ form: "Invalid request." });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return errors.validation(fieldErrors(parsed.error));

  // Safety guidance is returned before anything that could fail or be rate limited.
  const latest = parsed.data.messages.at(-1);
  if (latest && isEmergencyMessage(latest.content)) return ok(emergencyReply());

  try {
    const limit = await checkRateLimits(deps.rateLimitStore(), hashIdentifier(clientIp(request), deps.rateLimitSalt), RATE_LIMITS.chat);
    if (!limit.allowed) return errors.rateLimited(limit.retryAfterSeconds);
  } catch (error) {
    // Fail closed: without a working limiter the paid AI endpoint stays off.
    logger.error("chat.rate_limit_unavailable", { errorName: error instanceof Error ? error.name : "unknown" });
    return fail(503, { code: "CHAT_UNAVAILABLE", message: UNAVAILABLE_MESSAGE });
  }

  try {
    const reply = await generateChatReply(parsed.data.messages, deps.chat());
    return ok(reply);
  } catch (error) {
    if (error instanceof ChatUnavailableError && error.reason === "busy") {
      return fail(503, { code: "CHAT_BUSY", message: "The assistant is busy or took too long to respond. Please try again in a moment." }, { "Retry-After": "20" });
    }
    if (error instanceof ChatUnavailableError) return fail(503, { code: "CHAT_UNAVAILABLE", message: UNAVAILABLE_MESSAGE });
    logger.error("chat.failed", { errorName: error instanceof Error ? error.name : "unknown" });
    return errors.internal();
  }
}
