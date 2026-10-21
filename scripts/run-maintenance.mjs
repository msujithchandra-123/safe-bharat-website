// Triggers the protected maintenance job (email retries, data retention, rate-limit cleanup).
// For self-hosted servers without Vercel Cron, schedule this with cron / Task Scheduler:
//   node scripts/run-maintenance.mjs https://www.example.com
import path from "node:path";
import dotenv from "dotenv";

// Same precedence as Next.js: .env.local first, .env as the fallback; variables already
// set in the process environment always win. Missing files are skipped.
const projectRoot = path.resolve(import.meta.dirname, "..");
dotenv.config({ path: [path.join(projectRoot, ".env.local"), path.join(projectRoot, ".env")], quiet: true });

const base = (process.argv[2] ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const secret = process.env.CRON_SECRET;
if (!secret) {
  console.error("CRON_SECRET is not set.");
  process.exit(1);
}
const res = await fetch(`${base}/api/v1/cron/maintenance`, { headers: { Authorization: `Bearer ${secret}` } });
console.log(res.status, await res.text());
process.exit(res.ok ? 0 : 1);
