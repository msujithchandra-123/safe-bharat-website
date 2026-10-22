import { connection } from "next/server";
import { getDb } from "@/lib/db";
import { serverEnv } from "@/lib/env";
import { isTurnstileTestSecret } from "@/lib/security/spam-protection";
import { activeChatProvider } from "@/lib/ai/provider";

/**
 * Liveness/readiness probe for uptime monitoring. Reports whether each
 * integration is configured, never the configuration values themselves.
 */
export async function GET(): Promise<Response> {
  await connection();
  let database: "ok" | "unavailable" | "not-configured" = "not-configured";
  if (serverEnv.databaseUrl()) {
    try {
      await getDb().$queryRaw`SELECT 1`;
      database = "ok";
    } catch {
      database = "unavailable";
    }
  }
  const body = {
    status: database === "ok" ? "ok" : "degraded",
    checks: {
      database,
      emailAutoRetry: serverEnv.emailAutoRetry() ? "enabled" : "paused",
      email: serverEnv.email().configured ? "configured" : "not-configured",
      spamProtection: !serverEnv.turnstile().secretKey
        ? "not-configured"
        : isTurnstileTestSecret(serverEnv.turnstile().secretKey)
          ? "test-keys"
          : "configured",
      assistant: activeChatProvider().configured ? "configured" : "not-configured",
      assistantProvider: activeChatProvider().name,
      attachments: serverEnv.attachments().configured ? "configured" : "not-configured",
    },
  };
  return Response.json(body, { status: database === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
