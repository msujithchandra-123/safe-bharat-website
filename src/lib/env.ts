import "server-only";

/**
 * Server-side configuration. Values are read lazily so that a missing optional
 * integration (email, AI, attachments) degrades that feature instead of
 * crashing the whole application.
 */

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

const FREE_MAIL_DOMAINS = new Set(["gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "outlook.com", "hotmail.com", "live.com", "rediffmail.com", "icloud.com"]);

export const serverEnv = {
  isProduction: () => process.env.NODE_ENV === "production",
  databaseUrl: () => read("DATABASE_URL"),

  email: () => {
    const apiKey = read("RESEND_API_KEY");
    // CONTACT_FROM_EMAIL / CONTACT_NOTIFICATION_EMAIL are accepted as aliases.
    const from = read("EMAIL_FROM") ?? read("CONTACT_FROM_EMAIL");
    const to = (read("ENQUIRY_NOTIFICATION_TO") ?? read("CONTACT_NOTIFICATION_EMAIL") ?? "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    // Resend only sends from domains you have verified; free-mail domains can never be verified.
    const senderDomain = from?.match(/@([^>\s]+)>?\s*$/)?.[1]?.toLowerCase();
    const senderUnverifiable = Boolean(senderDomain && FREE_MAIL_DOMAINS.has(senderDomain));
    return {
      configured: Boolean(apiKey && from && to.length > 0 && !senderUnverifiable),
      senderUnverifiable,
      apiKey,
      from,
      to,
      sendAcknowledgement: read("SEND_CUSTOMER_ACKNOWLEDGEMENT") !== "false",
    };
  },

  turnstile: () => ({ secretKey: read("TURNSTILE_SECRET_KEY"), allowTestKeys: read("ALLOW_TURNSTILE_TEST_KEYS") === "true" }),

  /** Which assistant provider is active. Chosen explicitly; there is no automatic fallback between providers. */
  llm: () => ({
    provider: read("LLM_PROVIDER") ?? "anthropic",
    // Anthropic settings (used when LLM_PROVIDER=anthropic).
    apiKey: read("LLM_API_KEY"),
    model: read("LLM_MODEL") ?? "claude-opus-5-5",
    effort: (["low", "medium", "high"] as const).find((e) => e === read("LLM_EFFORT")) ?? "low",
  }),

  /** Google Gemini settings (used when LLM_PROVIDER=gemini). Server-only: never use a NEXT_PUBLIC_ name. */
  gemini: () => ({
    apiKey: read("GEMINI_API_KEY"),
    // Verified on 2026-10-15 against ai.google.dev/gemini-api/docs/models (stable, no shutdown date announced).
    model: read("GEMINI_MODEL") ?? "gemini-3.5-flash-lite",
    thinkingLevel: (["minimal", "low", "medium", "high"] as const).find((l) => l === read("GEMINI_THINKING_LEVEL")) ?? "low",
  }),

  attachments: () => {
    const bucket = read("ATTACHMENTS_BUCKET");
    const accessKeyId = read("ATTACHMENTS_ACCESS_KEY_ID");
    const secretAccessKey = read("ATTACHMENTS_SECRET_ACCESS_KEY");
    return {
      configured: Boolean(bucket && accessKeyId && secretAccessKey),
      bucket,
      region: read("ATTACHMENTS_REGION") ?? "auto",
      endpoint: read("ATTACHMENTS_ENDPOINT"),
      accessKeyId,
      secretAccessKey,
    };
  },

  cronSecret: () => read("CRON_SECRET"),
  /**
   * Automatic resending of failed enquiry notifications (after new submissions and in the
   * scheduled job). Enabled unless EMAIL_AUTO_RETRY is explicitly "false".
   */
  emailAutoRetry: () => (read("EMAIL_AUTO_RETRY") ?? "true").toLowerCase() !== "false",
  /** Days an enquiry (and its attachments) is kept before the maintenance job deletes it. */
  retentionDays: () => {
    const n = Number(read("ENQUIRY_RETENTION_DAYS") ?? "730");
    return Number.isInteger(n) && n >= 30 ? n : 730;
  },
  rateLimitSalt: () => read("RATE_LIMIT_SALT") ?? "safe-bharat-default-salt",
};
