// Applies migrations to the integration-test database (TEST_DATABASE_URL).
import path from "node:path";
import dotenv from "dotenv";

// Same precedence as Next.js: .env.local first, .env as the fallback; variables already
// set in the process environment always win. Missing files are skipped.
const projectRoot = path.resolve(import.meta.dirname, "..");
dotenv.config({ path: [path.join(projectRoot, ".env.local"), path.join(projectRoot, ".env")], quiet: true });
import { spawnSync } from "node:child_process";

const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith("_test")) {
  console.error("TEST_DATABASE_URL must be set and point at a database ending in _test.");
  process.exit(1);
}
const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, DATABASE_URL: url },
});
process.exit(result.status ?? 1);
