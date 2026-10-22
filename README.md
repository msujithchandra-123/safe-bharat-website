# Safe Bharat Fire and Safety Solutions — Website

Corporate website for Safe Bharat Fire and Safety Solutions (Visakhapatnam, Andhra Pradesh). It includes:

- Multi-page marketing site: services, industries, projects, equipment catalogue, resources and legal pages.
- Contact, quotation, AMC and equipment enquiry forms backed by PostgreSQL.
- Email notifications with failure recovery.
- Server-verified spam protection.
- An AI assistant ("Safe Bharat Assistant") that answers from approved site content and captures leads through the same enquiry pipeline.

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, Partial Prerendering), React 19, TypeScript (strict) |
| UI | Tailwind CSS v4, Framer Motion, Lucide icons, Manrope + Inter (`next/font`) |
| Forms | React Hook Form + Zod (one schema shared by browser, API and chatbot) |
| Data | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`), migrations in `prisma/migrations` |
| Email | SMTP via Nodemailer (Gmail with an App Password by default), retry outbox |
| Anti-spam | Cloudflare Turnstile (server-side verification), honeypot, PostgreSQL-backed rate limiting |
| AI | Google Gemini (`@google/genai`) or Anthropic Claude (`@anthropic-ai/sdk`), selected with `LLM_PROVIDER`, behind a `ChatProvider` interface |
| Tests | Vitest + Testing Library (unit/component), Vitest against real PostgreSQL (integration), Playwright + axe (E2E/accessibility) |

## Run locally

Prerequisites: Node.js 22+, npm, Docker (for the local database).

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # then fill in any credentials you have
docker compose up -d        # PostgreSQL 15 on localhost:5444 (dev + test databases)
npm run db:migrate          # apply migrations to the dev database
npm run dev                 # http://localhost:3000
```

The site works without external credentials, with these differences:

- **Without email credentials:** enquiries are saved and marked `NOT_CONFIGURED`. They are sent automatically once email is configured.
- **Without `LLM_API_KEY`:** the chat panel shows an honest "offline" state. Quote requests and contact options still work.
- **Turnstile test keys:** `.env.example` ships Cloudflare's official always-pass test keys for local development.

## Run on Windows without Docker

Docker is only one way to provide PostgreSQL; the app itself always runs directly on Node.js.

1. Point `DATABASE_URL` at a PostgreSQL you can reach without Docker. Either:
   - a native Windows PostgreSQL service (pgAdmin / the EDB installer; default port 5432). Create a database and user for this site, for example with `psql -U postgres` from the PostgreSQL `bin` folder; or
   - a managed cloud database (Neon, Supabase…), using its connection string with `?sslmode=require`.
2. Put secrets in `.env.local` (git-ignored; Next.js loads it in addition to `.env` and it takes precedence).
3. In PowerShell, from the project folder:

```powershell
npm install                 # first time only; runs prisma generate
npx prisma migrate deploy   # creates the tables in the database DATABASE_URL points at (non-destructive)
npm run dev                 # http://localhost:3000
# or, for a production build:
npm run build
npm start
```

Check `http://localhost:3000/api/v1/health`: `"database": "ok"` means Prisma reached PostgreSQL. The integration tests (`npm run test:integration`) additionally need `TEST_DATABASE_URL` pointing at a separate database whose name ends in `_test`.

## Email notifications (Gmail SMTP)

The site signs in to a Gmail mailbox over SMTP and sends every notification from it, to any recipient. No domain is required.

1. Sign in to the sending Gmail account (`safebharatsales@gmail.com`) and turn on **2-Step Verification** (myaccount.google.com → Security).
2. Create an **App Password** at myaccount.google.com/apppasswords. Your normal Gmail password does not work for SMTP.
3. Set in `.env.local` (locally) and in the hosting provider's environment settings (production) — never in a `NEXT_PUBLIC_*` variable:
   - `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`
   - `SMTP_USER=safebharatsales@gmail.com`
   - `SMTP_PASSWORD` = the 16-character App Password (spaces are ignored)
   - `EMAIL_FROM` (alias `CONTACT_FROM_EMAIL`), e.g. `Safe Bharat <safebharatsales@gmail.com>`. Keep it on the `SMTP_USER` mailbox; Gmail rewrites any other From address.
   - `ENQUIRY_NOTIFICATION_TO` (alias `CONTACT_NOTIFICATION_EMAIL`) = `safebharatsales@gmail.com`
4. Restart the server and check `/api/v1/health`: `"email": "configured"`.

Every enquiry is saved before any email is attempted. The notification includes the enquiry type, contact details, message and service/product/AMC details, with the customer's address as Reply-To. Failures and timeouts (10 s) are recorded on the enquiry and retried by the maintenance job. Each email keeps a fixed Message-ID across retries, but SMTP cannot guarantee exactly-once delivery: a send that times out after the server accepted it can arrive twice. Gmail allows roughly 500 recipients per day.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types and run `tsc --noEmit` |
| `npm test` | Unit and component tests (no network, no database) |
| `npm run test:db:migrate` | Apply migrations to `TEST_DATABASE_URL` |
| `npm run test:integration` | Integration tests against the real test database |
| `npm run test:e2e` | Playwright E2E + accessibility (requires `npm run build` first; uses the test database and Cloudflare test keys, so needs network) |
| `npm run db:migrate` | Create/apply migrations in development |
| `npm run db:deploy` | Apply migrations in production |
| `npm run maintenance:run` | Trigger the maintenance job (email retries, retention, rate-limit cleanup) |

Automated tests never call the paid AI API. The chatbot is tested with a stub provider.

## Project structure

```text
prisma/                 schema.prisma and migrations
scripts/                brand-asset preparation, test-DB migration, maintenance trigger
src/app/                routes (pages, API route handlers under api/v1, sitemap, robots, icons)
src/proxy.ts            returns real 404s for unknown content slugs before rendering
src/components/         layout, navigation, sections, cards, forms, chatbot, ui
src/content/            approved business content (services, industries, equipment, resources, legal…)
src/config/             site facts (contact details, GSTIN) and navigation
src/lib/                validation, enquiries, email, security, storage, ai, db, seo
tests/                  unit, integration and shared test support
e2e/                    Playwright specs
docs/                   deployment, operations and content-review notes
```

## API

All responses use `{ ok: true, data }` or `{ ok: false, error: { code, message, fields? } }`. Raw errors are never returned.

| Endpoint | Description |
| --- | --- |
| `POST /api/v1/enquiries` | Contact, quote, AMC, equipment and callback enquiries (JSON, or multipart with an optional attachment). Validated → rate limited → honeypot → Turnstile → saved → notified. Returns `201 { referenceNumber }`; a repeated idempotency key returns `200` with the original reference. |
| `POST /api/v1/chat` | Assistant replies (`{ kind, reply, action, service, links }`). Emergency messages get fixed safety guidance without calling the AI. Returns `503 CHAT_UNAVAILABLE` when not configured. |
| `GET /api/v1/chat/status` | Whether the assistant is configured. |
| `POST /api/v1/chat/feedback` | Anonymous helpful / not-helpful rating (no message content). |
| `GET /api/v1/health` | Readiness: database connectivity, and which integrations are configured (never their values). |
| `GET /api/v1/cron/maintenance` | `Authorization: Bearer $CRON_SECRET`. Email retries, retention purge, rate-limit cleanup. |

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md), [docs/OPERATIONS.md](docs/OPERATIONS.md) and [docs/CONTENT_REVIEW.md](docs/CONTENT_REVIEW.md).
