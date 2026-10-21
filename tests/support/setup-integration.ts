import dotenv from "dotenv";

// Same precedence as Next.js: .env.local first, .env as the fallback; variables already
// set in the process environment always win. Missing files are skipped.
dotenv.config({ path: [".env.local", ".env"], quiet: true });

/**
 * Integration tests run against a real PostgreSQL database (TEST_DATABASE_URL, a
 * separate database whose name ends in _test, migrated with `npm run test:db:migrate`).
 * They never touch the development database.
 */
const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error("TEST_DATABASE_URL is not set. See .env.example.");
if (!new URL(url).pathname.endsWith("_test")) {
  throw new Error("TEST_DATABASE_URL must point at a database whose name ends in _test.");
}
process.env.DATABASE_URL = url;
