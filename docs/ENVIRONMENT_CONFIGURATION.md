# Environment configuration: Safe Bharat website

| | |
| --- | --- |
| Document version | 1.0 |
| Prepared | 2026-10-21 |
| Template | [`.env.example`](../.env.example) (the only environment file intended for version control) |
| Companion documents | [`BACKEND_DEVELOPER_HANDOVER.md`](BACKEND_DEVELOPER_HANDOVER.md), [`DEPLOYMENT.md`](DEPLOYMENT.md) |

> **No secret values appear in this document.**
> - "Local status" was checked on 2026-10-21 by reading only whether each variable is set. A few non-secret values are shown where they matter: the provider choice, flags, and the sender's domain.
> - Production values do not exist yet: the site has not been deployed.
> - Never commit `.env` or `.env.local`, and never share them, or the `.env.local.bak-*` backups in the project root, with anyone. `.gitignore` excludes `.env*` except `.env.example`.

## How configuration is loaded

- **Local precedence:** Next.js, Prisma (`prisma.config.ts`) and the helper scripts all load `.env.local` first, then `.env`. Variables already set in the process environment always win, and missing files are skipped.
- **Server code:** server variables are read lazily through `serverEnv` in `src/lib/env.ts`, which trims them and treats empty as unset. A missing optional integration disables that feature; it does not crash the app.
- **Browser variables:** `NEXT_PUBLIC_*` values are **embedded in the browser bundle at build time**. Change them, then rebuild and redeploy.
- **Validation:** there is no start-up schema validation. Misconfiguration shows up in `/api/v1/health`, and in specific behaviour noted below.

## Variable reference

Status key:
- **Set** / **Empty**: the local state on 2026-10-21.
- **Prod: pending**: must be set by the deploying developer.
- **Prod: verify**: must be checked on the live site after deployment.

### Site and database

| Variable | Purpose | Required | Used in | Local status | Production |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO, sitemap, Open Graph and JSON-LD; the allowed `Origin` for the API; the indexing switch | **Required** for production | `src/config/site.ts`, `src/lib/seo.ts`, `scripts/run-maintenance.mjs` | Set, to a local `http://localhost` address | **Pending**: needs the confirmed `https://` domain. Placeholder, reserved and IP hosts keep the site `noindex`. |
| `DATABASE_URL` | PostgreSQL connection for the app and Prisma CLI | **Required** | `src/lib/db.ts`, `src/lib/env.ts`, `prisma.config.ts` | Set (local PostgreSQL 17, database `safebharat`) | **Pending**: a managed PostgreSQL. Use a pooled URL on serverless hosts, and `?sslmode=require` where the provider needs it. |
| `TEST_DATABASE_URL` | Integration and E2E test database. Its name **must end in `_test`**; this is enforced. | Tests only | `tests/support/setup-integration.ts`, `scripts/migrate-test-db.mjs`, `playwright.config.ts` | Set (`safebharat_test`) | Never set in production |
| `NODE_ENV` | `production` makes Turnstile fail closed and turns on HSTS and the stricter CSP | Set by Next.js | `src/lib/env.ts`, `next.config.ts`, `src/lib/logger.ts` | – | Set automatically by `next build` / `next start` |
| `VERCEL_ENV` | Only `production` allows search indexing | Set by Vercel | `src/lib/seo.ts` | – | Automatic on Vercel |

### Email (Resend)

| Variable | Purpose | Required | Used in | Local status | Production |
| --- | --- | --- | --- | --- | --- |
| `RESEND_API_KEY` | Resend API key, server-only | Required for email | `src/lib/env.ts` → `src/lib/runtime.ts` | Set | **Pending**: a production key |
| `EMAIL_FROM` (alias `CONTACT_FROM_EMAIL`) | Sender, for example `Safe Bharat <enquiries@<verified-domain>>`. Free-mail domains such as gmail.com are refused by the code (`senderUnverifiable`). | Required for email | `src/lib/env.ts` | Set, sender domain **`resend.dev`** (the Resend testing sender) | **Pending**: must be on a domain verified in Resend |
| `ENQUIRY_NOTIFICATION_TO` (alias `CONTACT_NOTIFICATION_EMAIL`) | Comma-separated business inboxes for new-enquiry notifications | Required for email | `src/lib/env.ts` | Set, to `safebharatsales@gmail.com` | **Verify** delivery on the live site |
| `SEND_CUSTOMER_ACKNOWLEDGEMENT` | `false` disables the customer acknowledgement email. Default: enabled. | Optional | `src/lib/env.ts` | Set, `true` | Owner decision |
| `EMAIL_AUTO_RETRY` | `false` pauses automatic resends (after submissions and in the cron job). Unset or `true` means enabled. | Optional | `src/lib/env.ts`, `src/lib/enquiries/automatic-retry.ts` | Set, **`false`** (paused locally) | Leave **unset** once the sender is verified |

### Spam protection (Cloudflare Turnstile)

| Variable | Purpose | Required | Used in | Local status | Production |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Widget site key (public) | Required in production | `src/components/forms/turnstile.tsx` | Set, to a Cloudflare **test** key | **Pending**: real key for the production hostname |
| `TURNSTILE_SECRET_KEY` | Server-side verification secret | Required in production | `src/lib/env.ts` → `src/lib/security/spam-protection.ts` | Set, to a Cloudflare **test** secret | **Pending**: real secret. A missing or test secret makes enquiries return 503 in production (fails closed). |
| `ALLOW_TURNSTILE_TEST_KEYS` | Lets a production build accept test keys, for the automated E2E run only | Never in a hosted environment | `src/lib/env.ts`, `playwright.config.ts` | Not set | **Must not be set** |

### AI assistant

| Variable | Purpose | Required | Used in | Local status | Production |
| --- | --- | --- | --- | --- | --- |
| `LLM_PROVIDER` | `gemini` or `anthropic`. Default `anthropic`; no automatic fallback between them. | Optional (assistant) | `src/lib/env.ts`, `src/lib/ai/provider.ts` | Set, `gemini` | Owner decision |
| `GEMINI_API_KEY` | Gemini key, server-only | Required if `gemini` | as above | Set | **Pending**: use a **billing-enabled** key (see `OPERATIONS.md`) |
| `GEMINI_MODEL` | Default `gemini-3.5-flash-lite` | Optional | `src/lib/env.ts` | Set, `gemini-3.5-flash-lite` | Verify the model is still available at launch |
| `GEMINI_THINKING_LEVEL` | `minimal`, `low`, `medium` or `high`. Default `low`. | Optional | `src/lib/env.ts` | Not set (default) | Optional |
| `LLM_API_KEY` | Anthropic key, server-only | Required if `anthropic` | `src/lib/env.ts` | Empty | Only if Anthropic is chosen |
| `LLM_MODEL` / `LLM_EFFORT` | Anthropic model (default `claude-opus-5-5`) and effort (`low`, `medium` or `high`; default `low`) | Optional | `src/lib/env.ts` | Set (defaults) | Only if Anthropic is chosen |

### Attachments (optional, S3-compatible private bucket)

| Variable | Purpose | Required | Used in | Local status | Production |
| --- | --- | --- | --- | --- | --- |
| `ATTACHMENTS_BUCKET`, `ATTACHMENTS_ACCESS_KEY_ID`, `ATTACHMENTS_SECRET_ACCESS_KEY` | All three are needed to enable uploads. Without them the upload field is hidden and the API rejects files. | Optional | `src/lib/env.ts` → `src/lib/runtime.ts`, `src/lib/storage/attachments.ts` | Empty (disabled) | Owner decision. If enabled: a private bucket, with a key limited to `PutObject` and `DeleteObject`. |
| `ATTACHMENTS_REGION` | Default `auto` (Cloudflare R2) | Optional | as above | Set, `auto` | – |
| `ATTACHMENTS_ENDPOINT` | Custom endpoint (R2 or another S3-compatible service); turns on path-style addressing | Optional | as above | Empty | – |

### Operations

| Variable | Purpose | Required | Used in | Local status | Production |
| --- | --- | --- | --- | --- | --- |
| `CRON_SECRET` | Bearer secret for `/api/v1/cron/maintenance`. If unset, the job always returns 401. | **Required** in production | `src/app/api/v1/cron/maintenance/route.ts`, `scripts/run-maintenance.mjs` | Set | **Pending**: a long random value in the hosting environment |
| `RATE_LIMIT_SALT` | Salt for hashing client IPs into rate-limit keys | **Required** in production | `src/lib/env.ts` | Set, to the **placeholder** from `.env.example` | **Pending**: a long random value. If unset, the code silently falls back to a built-in default. |
| `ENQUIRY_RETENTION_DAYS` | Days before the maintenance job deletes an enquiry. Integer, at least 30; otherwise 730 is used. | Optional | `src/lib/env.ts` | Set, `730` | Must match the privacy policy (legal and owner decision) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Shows WhatsApp shortcuts when set | Optional | `src/config/site.ts` | Empty (hidden) | Owner decision |
| `DEBUG_LOGS` | Enables logger output while `NODE_ENV=test` | Tests only | `src/lib/logger.ts` | Not set | Not used |
| `LIVE_EMAIL_TEST_TO`, `LIVE_EMAIL_TEST_SEND` | Opt-in, one-off live Resend test (`npm run email:test`) | Manual testing only | `tests/live/resend-test-email.test.ts` | Not set | Never set permanently |

## Production configuration checklist

1. Set every variable marked **Pending** in the hosting provider's encrypted environment settings, separately for Production and Preview, with a separate database and keys for Preview.
2. Generate `CRON_SECRET` and `RATE_LIMIT_SALT` with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
3. Rebuild after setting any `NEXT_PUBLIC_*` value.
4. Confirm `ALLOW_TURNSTILE_TEST_KEYS` is absent.
5. After deployment, check `GET /api/v1/health`. It should show:
   - `database: "ok"`
   - `email: "configured"`
   - `spamProtection: "configured"`
   - `emailAutoRetry: "enabled"`
   - `assistant` as intended
6. Health only checks configuration. Email delivery still has to be proved with a real test enquiry (handover, section E).
