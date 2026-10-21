import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Same precedence as Next.js: .env.local first, .env as the fallback; variables already
// set in the process environment always win. Missing files are skipped.
dotenv.config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
