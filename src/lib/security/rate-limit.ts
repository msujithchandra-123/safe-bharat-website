import type { PrismaClient } from "@/generated/prisma/client";

/**
 * Fixed-window rate limiting backed by a store shared by every application
 * instance. The PostgreSQL store performs one atomic upsert per hit, so
 * concurrent requests on different servers are counted correctly.
 */

export interface RateLimitStore {
  /** Atomically increments the counter for `key` and returns the new state. */
  hit(key: string, windowMs: number): Promise<{ count: number; resetAt: Date }>;
}

export interface RateLimitRule {
  name: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  rule?: RateLimitRule;
  retryAfterSeconds: number;
}

export class PostgresRateLimitStore implements RateLimitStore {
  constructor(private readonly db: PrismaClient) {}

  async hit(key: string, windowMs: number): Promise<{ count: number; resetAt: Date }> {
    const rows = await this.db.$queryRaw<{ count: number; expiresAt: Date }[]>`
      INSERT INTO "RateLimitBucket" ("key", "count", "expiresAt")
      VALUES (${key}, 1, now() + (${windowMs}::int * interval '1 millisecond'))
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimitBucket"."expiresAt" <= now() THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
        "expiresAt" = CASE WHEN "RateLimitBucket"."expiresAt" <= now() THEN EXCLUDED."expiresAt" ELSE "RateLimitBucket"."expiresAt" END
      RETURNING "count", "expiresAt"
    `;
    const row = rows[0];
    if (!row) throw new Error("Rate limit upsert returned no row");
    return { count: Number(row.count), resetAt: new Date(row.expiresAt) };
  }

  /** Housekeeping, run from the scheduled maintenance job. */
  async purgeExpired(): Promise<number> {
    return this.db.$executeRaw`DELETE FROM "RateLimitBucket" WHERE "expiresAt" < now() - interval '1 hour'`;
  }
}

/** In-process store for unit tests only; it is not shared between instances. */
export class MemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, { count: number; resetAt: number }>();
  constructor(private readonly now: () => number = Date.now) {}

  async hit(key: string, windowMs: number) {
    const t = this.now();
    const existing = this.buckets.get(key);
    if (!existing || existing.resetAt <= t) {
      const fresh = { count: 1, resetAt: t + windowMs };
      this.buckets.set(key, fresh);
      return { count: 1, resetAt: new Date(fresh.resetAt) };
    }
    existing.count += 1;
    return { count: existing.count, resetAt: new Date(existing.resetAt) };
  }
}

export async function checkRateLimits(
  store: RateLimitStore,
  identifier: string,
  rules: readonly RateLimitRule[],
  now: () => number = Date.now,
): Promise<RateLimitResult> {
  for (const rule of rules) {
    const { count, resetAt } = await store.hit(`${rule.name}:${identifier}`, rule.windowMs);
    if (count > rule.limit) {
      return { allowed: false, rule, retryAfterSeconds: Math.max(1, (resetAt.getTime() - now()) / 1000) };
    }
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

const MINUTE = 60_000;

export const RATE_LIMITS = {
  enquiry: [
    { name: "enquiry-10m", limit: 5, windowMs: 10 * MINUTE },
    { name: "enquiry-24h", limit: 20, windowMs: 24 * 60 * MINUTE },
  ],
  chat: [
    { name: "chat-10m", limit: 20, windowMs: 10 * MINUTE },
    { name: "chat-24h", limit: 120, windowMs: 24 * 60 * MINUTE },
  ],
} as const satisfies Record<string, readonly RateLimitRule[]>;
