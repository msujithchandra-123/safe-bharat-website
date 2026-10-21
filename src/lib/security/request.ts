import { createHash } from "node:crypto";

export class PayloadTooLargeError extends Error {
  constructor() {
    super("Payload too large");
    this.name = "PayloadTooLargeError";
  }
}

/**
 * Reads the request body while enforcing a hard byte limit, even when the
 * client omits or misreports Content-Length.
 */
export async function readBodyWithLimit(request: Request, maxBytes: number): Promise<Uint8Array> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > maxBytes) throw new PayloadTooLargeError();
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new PayloadTooLargeError();
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function readJsonWithLimit(request: Request, maxBytes: number): Promise<unknown> {
  const bytes = await readBodyWithLimit(request, maxBytes);
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  return JSON.parse(text);
}

/**
 * Best-effort client IP. On Vercel and most managed platforms the proxy
 * overwrites these headers; on a self-hosted server make sure the reverse
 * proxy sets them and strips client-supplied values.
 */
export function clientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}

/** IP addresses are hashed before use so raw IPs are never stored. */
export function hashIdentifier(value: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 40);
}

/** Rejects cross-site browser submissions; non-browser clients send no Origin. */
export function isAllowedOrigin(request: Request, siteUrl: string): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const allowed = new URL(siteUrl).origin;
    const requestOrigin = new URL(request.url).origin;
    return origin === allowed || origin === requestOrigin;
  } catch {
    return false;
  }
}
