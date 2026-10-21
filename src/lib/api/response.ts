/**
 * Consistent JSON envelope for every public API route:
 *   success → { ok: true, data }
 *   failure → { ok: false, error: { code, message, fields? } }
 * Raw exceptions and database errors are never included.
 */

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "SPAM_CHECK_FAILED"
  | "RATE_LIMITED"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "SERVICE_UNAVAILABLE"
  | "CHAT_UNAVAILABLE"
  | "CHAT_BUSY"
  | "UNAUTHORIZED"
  | "INTERNAL_ERROR";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  fields?: Record<string, string>;
}

export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: ApiError };

const NO_STORE = { "Cache-Control": "no-store" };

export function ok<T>(data: T, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json({ ok: true, data } satisfies ApiResponse<T>, { status, headers: { ...NO_STORE, ...headers } });
}

export function fail(status: number, error: ApiError, headers: Record<string, string> = {}): Response {
  return Response.json({ ok: false, error } satisfies ApiResponse<never>, { status, headers: { ...NO_STORE, ...headers } });
}

export const errors = {
  validation: (fields: Record<string, string>) =>
    fail(422, { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields }),
  spam: () => fail(400, { code: "SPAM_CHECK_FAILED", message: "We could not verify this submission. Please complete the security check and try again." }),
  rateLimited: (retryAfterSeconds: number) =>
    fail(
      429,
      { code: "RATE_LIMITED", message: "Too many requests. Please wait a few minutes and try again." },
      { "Retry-After": String(Math.max(1, Math.ceil(retryAfterSeconds))) },
    ),
  tooLarge: () => fail(413, { code: "PAYLOAD_TOO_LARGE", message: "The submission is too large." }),
  unsupported: () => fail(415, { code: "UNSUPPORTED_MEDIA_TYPE", message: "Unsupported request format." }),
  unavailable: (message = "This service is temporarily unavailable. Please call or email us instead.") =>
    fail(503, { code: "SERVICE_UNAVAILABLE", message }),
  internal: () => fail(500, { code: "INTERNAL_ERROR", message: "Something went wrong on our side. Please try again, or call or email us." }),
  unauthorized: () => fail(401, { code: "UNAUTHORIZED", message: "Unauthorized." }),
};
