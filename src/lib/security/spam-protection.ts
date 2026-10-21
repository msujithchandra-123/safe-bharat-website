import { logger } from "@/lib/logger";

/**
 * Server-side Cloudflare Turnstile verification.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type SpamCheckResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; reason: "missing-token" | "invalid-token" | "verification-unavailable" | "not-configured" };

/**
 * Cloudflare's published test secrets always pass, always fail, or always
 * return "token already spent". They must never protect a production site.
 * https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 */
export function isTurnstileTestSecret(secret: string | undefined): boolean {
  return Boolean(secret && /^[123]x0{30,}AA$/.test(secret));
}

export interface SpamVerifierOptions {
  secretKey: string | undefined;
  isProduction: boolean;
  /** Only for automated tests against a production build. Never set on a real deployment. */
  allowTestKeys?: boolean;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp: string | undefined,
  { secretKey, isProduction, allowTestKeys = false, fetchImpl = fetch, timeoutMs = 5000 }: SpamVerifierOptions,
): Promise<SpamCheckResult> {
  if (isProduction && isTurnstileTestSecret(secretKey) && !allowTestKeys) {
    logger.error("turnstile.test_key_in_production");
    return { ok: false, reason: "not-configured" };
  }
  if (!secretKey) {
    // Fail closed in production; allow local development without keys.
    if (isProduction) {
      logger.error("turnstile.not_configured");
      return { ok: false, reason: "not-configured" };
    }
    logger.warn("turnstile.skipped_in_development");
    return { ok: true, skipped: true };
  }
  if (!token) return { ok: false, reason: "missing-token" };

  const body = new URLSearchParams({ secret: secretKey, response: token });
  if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);

  try {
    const res = await fetchImpl(SITEVERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      logger.warn("turnstile.http_error", { status: res.status });
      return { ok: false, reason: "verification-unavailable" };
    }
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (data.success === true) return { ok: true };
    logger.info("turnstile.rejected", { codes: data["error-codes"]?.join(",") });
    return { ok: false, reason: "invalid-token" };
  } catch (error) {
    logger.warn("turnstile.request_failed", { errorName: error instanceof Error ? error.name : "unknown" });
    return { ok: false, reason: "verification-unavailable" };
  }
}
