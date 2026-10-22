# Deployment

> Current launch status, blockers and the ordered pre-launch checklist: [`LAUNCH_READINESS.md`](LAUNCH_READINESS.md).

The site is a standard Next.js 16 Node.js application. Vercel is the simplest host, and the steps below assume it. Any Node.js host works (see "Self-hosting").

## 1. External services to set up

| Service | What to do | Environment variables |
| --- | --- | --- |
| **PostgreSQL** (Neon, Supabase, AWS RDS, Vercel Postgres…) | Create a database; enable automated backups (see OPERATIONS.md). Use a pooled connection string on serverless hosts. | `DATABASE_URL` |
| **Gmail SMTP** | On the sending Gmail account, turn on 2-Step Verification and create an App Password. | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` (the App Password), `EMAIL_FROM` (on the `SMTP_USER` mailbox), `ENQUIRY_NOTIFICATION_TO`, `SEND_CUSTOMER_ACKNOWLEDGEMENT` |
| **Cloudflare Turnstile** | Create a widget for the production hostname. | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |
| **Google Gemini** (optional, AI assistant) | In Google AI Studio (aistudio.google.com/apikey), create a key in a project with **billing enabled** (paid tier). | `LLM_PROVIDER=gemini`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_THINKING_LEVEL` |
| **Anthropic** (optional alternative) | Create an API key at platform.claude.com/settings/keys. | `LLM_PROVIDER=anthropic`, `LLM_API_KEY`, `LLM_MODEL`, `LLM_EFFORT` |
| **S3-compatible bucket** (optional, e.g. Cloudflare R2, AWS S3) | Create a **private** bucket (no public access) and an access key limited to `PutObject` / `DeleteObject` on that bucket. Add a lifecycle rule if desired. | `ATTACHMENTS_BUCKET`, `ATTACHMENTS_REGION`, `ATTACHMENTS_ENDPOINT` (R2/custom only), `ATTACHMENTS_ACCESS_KEY_ID`, `ATTACHMENTS_SECRET_ACCESS_KEY` |

Also set:

- `NEXT_PUBLIC_SITE_URL`: the canonical production URL, e.g. `https://www.example.in`. It is used for canonical URLs, the sitemap, Open Graph and structured data, and the cross-origin check. **Search engines can index the site only when this is set to the real `https://` domain.** If it is missing or uses `http://`, or its host is `localhost`, a placeholder (`example.*`, such as the `www.example.in` used in these docs), a reserved test name (`.invalid`, `.test`, `.example`, `.local`, `.internal`) or an IP address, or the build is a Vercel Preview deployment (`VERCEL_ENV` other than `production`), every page is `noindex` and `robots.txt` disallows all crawling (`src/lib/seo.ts`, `searchIndexingAllowed`). `NEXT_PUBLIC_*` values are fixed at build time, so redeploy after setting it. A `*.vercel.app` address is technically accepted; set the custom domain before the first production build so that it, not the Vercel address, becomes the canonical domain. Choose one form of the domain (with or without `www`) and redirect the other to it at the host.
- `CRON_SECRET`: a long random string, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `RATE_LIMIT_SALT`: a long random string.
- `ENQUIRY_RETENTION_DAYS`: defaults to 730. It must match the privacy policy.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: optional. Set it only after confirming the number is on WhatsApp.

`NEXT_PUBLIC_*` values are embedded at build time. Redeploy after changing them, or after enabling attachments (the quote form decides at build time whether to show the upload field).

Production behaviour when something is missing:

- **No `TURNSTILE_SECRET_KEY`:** enquiries fail closed with a 503 that tells visitors to phone or email. This is deliberate.
- **Cloudflare test secret (`1x000…AA` etc., as in `.env.example`):** refused in production in the same fail-closed way, and `/api/v1/health` reports `spamProtection: "test-keys"`. **Never set `ALLOW_TURNSTILE_TEST_KEYS`** on a real deployment. It exists only so the automated E2E suite can run against a local production build.
- **No email credentials:** enquiries are still saved and sent later, once email is configured.
- **No `LLM_API_KEY`:** the assistant shows its offline state.

## 2. Deploy on Vercel

1. Import the repository. The framework is detected automatically, and the build command is `npm run build` (`postinstall` runs `prisma generate`).
2. Add the environment variables above for Production (and Preview, with separate database and keys).
3. Apply migrations before the first deploy, and on every release that changes the schema: `DATABASE_URL=<production url> npx prisma migrate deploy`. You can do this from CI or locally. Never run `migrate dev` against production.
4. Deploy. `vercel.json` registers a daily Vercel Cron call to `/api/v1/cron/maintenance` (Vercel sends `CRON_SECRET` as the bearer token). On a Pro plan you can make it more frequent, e.g. `*/15 * * * *`. New submissions also retry stalled notifications in the background.
5. Check `https://<domain>/api/v1/health`. It returns `200` with `database: "ok"` and shows which integrations are configured. `spamProtection` must say `configured`, not `test-keys`.
6. Submit a real test enquiry on the live site. Confirm the reference number, the database row, and the email in the business inbox.

Notes:

- Request bodies are limited to 4.5 MB on Vercel functions. Attachments are capped at 4 MB to stay under that limit.
- The app uses the Node.js runtime throughout. Cache Components does not support the Edge runtime.

## 3. Self-hosting (any Node.js server)

```bash
npm ci
npx prisma migrate deploy
npm run build
npm start   # behind a reverse proxy (nginx, Caddy) that terminates TLS
```

- The reverse proxy **must** set `X-Forwarded-For` / `X-Real-IP` and strip client-supplied values. Rate limiting keys on them.
- Schedule the maintenance job, e.g. every 15 minutes with cron: `node scripts/run-maintenance.mjs https://www.example.in`.
- Run with a process manager (systemd, PM2) and restart on failure.

## 4. Post-launch checklist

- [ ] Real Turnstile keys in place, and health shows `spamProtection: "configured"`. Production refuses the test keys.
- [ ] `ALLOW_TURNSTILE_TEST_KEYS` is **not** set in the hosting environment.
- [ ] `docs/OWNER_APPROVAL_CHECKLIST.md` launch blockers resolved.
- [ ] `docs/ASSET_SOURCES.md` reviewed; banner image rights confirmed.
- [ ] `EMAIL_FROM` on a verified domain; notification and acknowledgement emails received.
- [ ] Health endpoint monitored by an uptime service.
- [ ] Database backups enabled and a restore tested (see OPERATIONS.md).
- [ ] `https://<domain>/robots.txt` shows `Allow: /`, `Disallow: /api/` and a `Sitemap:` line on the real domain (not `Disallow: /`).
- [ ] View the source of a few pages: no `noindex` on public pages, and `<link rel="canonical">`, `og:url` and JSON-LD URLs use the real domain.
- [ ] `https://<domain>/sitemap.xml` lists only real-domain URLs; spot-check that each returns `200`.
- [ ] Google Search Console property added (a Domain property, verified by DNS) and `sitemap.xml` submitted. Do the same in Bing Webmaster Tools if wanted.
- [ ] Test the home page and one service page in Google's Rich Results Test and the Schema Markup Validator (validator.schema.org).
- [ ] Google Business Profile created or claimed with the same name, address and phone numbers as the site.
- [ ] Items in CONTENT_REVIEW.md signed off by Safe Bharat.
- [ ] Privacy policy and terms reviewed by a legal adviser.
