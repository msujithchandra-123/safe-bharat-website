/**
 * Minimal structured logger. Only operational metadata is logged: never
 * message bodies, contact details, tokens or API keys.
 */
type Level = "info" | "warn" | "error";

const REDACT_KEYS = /(key|token|secret|password|authorization|email|phone|message|content|name)/i;

function sanitise(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (REDACT_KEYS.test(k) && !/^(enquiryType|errorName|provider|model|route|referenceNumber)$/.test(k)) {
      out[k] = "[redacted]";
    } else if (v instanceof Error) {
      out[k] = v.name;
    } else {
      out[k] = v;
    }
  }
  return out;
}

function write(level: Level, event: string, meta: Record<string, unknown> = {}) {
  if (process.env.NODE_ENV === "test" && !process.env.DEBUG_LOGS) return;
  const line = JSON.stringify({ level, event, at: new Date().toISOString(), ...sanitise(meta) });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (event: string, meta?: Record<string, unknown>) => write("info", event, meta),
  warn: (event: string, meta?: Record<string, unknown>) => write("warn", event, meta),
  error: (event: string, meta?: Record<string, unknown>) => write("error", event, meta),
};
