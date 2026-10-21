import dotenv from "dotenv";
import { defineConfig, devices } from "@playwright/test";

// Same precedence as Next.js: .env.local first, .env as the fallback; variables already
// set in the process environment always win. Missing files are skipped.
dotenv.config({ path: [".env.local", ".env"], quiet: true });

/**
 * End-to-end tests run against a production build (`npm run build` first),
 * using the integration-test database. Turnstile uses Cloudflare's official
 * always-pass test keys from .env.example, so form tests need network access.
 */
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 2,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 } }, testIgnore: /mobile\.spec/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec/ },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/v1/health`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? "",
      // Assistant intentionally unconfigured: verifies the honest offline fallback.
      // Both provider keys are blanked so the run never calls a paid AI API, whichever
      // LLM_PROVIDER .env.local selects (Next.js keeps a variable that is already set, even if empty).
      LLM_API_KEY: "",
      GEMINI_API_KEY: "",
      RESEND_API_KEY: "",
      // The E2E run uses Cloudflare's always-pass test keys against a production build.
      ALLOW_TURNSTILE_TEST_KEYS: "true",
    },
  },
});
