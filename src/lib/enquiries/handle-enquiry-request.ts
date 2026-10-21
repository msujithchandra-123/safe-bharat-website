import { siteConfig } from "@/config/site";
import { errors, ok } from "@/lib/api/response";
import { logger } from "@/lib/logger";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { AttachmentsNotConfiguredError, submitEnquiry, type EnquiryServiceDeps } from "@/lib/enquiries/enquiry-service";
import { checkRateLimits, RATE_LIMITS, type RateLimitStore } from "@/lib/security/rate-limit";
import { clientIp, hashIdentifier, isAllowedOrigin, PayloadTooLargeError, readBodyWithLimit } from "@/lib/security/request";
import type { SpamCheckResult } from "@/lib/security/spam-protection";
import { ATTACHMENT_MAX_BYTES, validateAttachment, type ValidatedAttachment } from "@/lib/storage/attachments";
import { enquiryEnvelopeSchema, enquiryPayloadSchema, fieldErrors } from "@/lib/validation/enquiry";

export const JSON_BODY_LIMIT = 32 * 1024;
export const MULTIPART_BODY_LIMIT = ATTACHMENT_MAX_BYTES + 256 * 1024;

export interface EnquiryHandlerDeps {
  service: () => EnquiryServiceDeps;
  rateLimitStore: () => RateLimitStore;
  verifySpam: (token: string | undefined, ip: string) => Promise<SpamCheckResult>;
  rateLimitSalt: string;
  attachmentsEnabled: boolean;
}

/**
 * POST /api/v1/enquiries — framework-independent handler so it can be tested
 * with real Request objects and injected dependencies.
 */
export async function handleEnquiryRequest(request: Request, deps: EnquiryHandlerDeps): Promise<Response> {
  if (!isAllowedOrigin(request, siteConfig.url)) return errors.unauthorized();

  const contentType = request.headers.get("content-type") ?? "";
  const isJson = contentType.startsWith("application/json");
  const isMultipart = contentType.startsWith("multipart/form-data");
  if (!isJson && !isMultipart) return errors.unsupported();

  const ip = clientIp(request);
  try {
    const limit = await checkRateLimits(deps.rateLimitStore(), hashIdentifier(ip, deps.rateLimitSalt), RATE_LIMITS.enquiry);
    if (!limit.allowed) return errors.rateLimited(limit.retryAfterSeconds);
  } catch (error) {
    logger.error("enquiry.rate_limit_unavailable", { errorName: error instanceof Error ? error.name : "unknown" });
    return errors.unavailable();
  }

  let raw: Record<string, unknown>;
  let attachment: ValidatedAttachment | null = null;
  try {
    const bytes = await readBodyWithLimit(request, isMultipart ? MULTIPART_BODY_LIMIT : JSON_BODY_LIMIT);
    if (isJson) {
      const parsed: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return errors.validation({ form: "Invalid submission." });
      raw = parsed as Record<string, unknown>;
    } else {
      const form = await new Response(bytes as BodyInit, { headers: { "content-type": contentType } }).formData();
      const payload = form.get("payload");
      if (typeof payload !== "string") return errors.validation({ form: "Invalid submission." });
      const parsed: unknown = JSON.parse(payload);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return errors.validation({ form: "Invalid submission." });
      raw = parsed as Record<string, unknown>;
      const file = form.get("attachment");
      if (file && typeof file !== "string" && file.size > 0) {
        if (!deps.attachmentsEnabled) return errors.validation({ attachment: "Attachments are not accepted at the moment. Please email the file instead." });
        const result = validateAttachment(new Uint8Array(await file.arrayBuffer()), file.name);
        if (!result.ok) return errors.validation({ attachment: result.message });
        attachment = result.file;
      }
    }
  } catch (error) {
    if (error instanceof PayloadTooLargeError) return errors.tooLarge();
    return errors.validation({ form: "Invalid submission." });
  }

  const envelope = enquiryEnvelopeSchema.safeParse(raw);
  if (!envelope.success) return errors.validation(fieldErrors(envelope.error));
  if (envelope.data.website) {
    logger.info("enquiry.honeypot_triggered");
    return errors.spam();
  }

  const payload = enquiryPayloadSchema.safeParse(raw);
  if (!payload.success) return errors.validation(fieldErrors(payload.error));

  const spam = await deps.verifySpam(envelope.data.turnstileToken, ip);
  if (!spam.ok) {
    if (spam.reason === "not-configured" || spam.reason === "verification-unavailable") return errors.unavailable();
    return errors.spam();
  }

  try {
    const result = await submitEnquiry(
      { payload: payload.data, source: envelope.data.source, idempotencyKey: envelope.data.idempotencyKey, attachment },
      deps.service(),
    );
    return ok(result, result.duplicate ? 200 : 201);
  } catch (error) {
    if (error instanceof AttachmentsNotConfiguredError) {
      return errors.validation({ attachment: "Attachments are not accepted at the moment. Please email the file instead." });
    }
    if (error instanceof DatabaseNotConfiguredError) {
      logger.error("enquiry.database_not_configured");
      return errors.unavailable();
    }
    logger.error("enquiry.save_failed", { errorName: error instanceof Error ? error.name : "unknown" });
    return errors.internal();
  }
}
