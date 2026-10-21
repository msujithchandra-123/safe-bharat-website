# Operations

## Where enquiries go

Every form submission and every chatbot lead becomes one row in the `Enquiry` table, with a reference number (`SB-YYMMDD-XXXXX`) and a `source` of `WEBSITE_FORM` or `CHATBOT`. The business inbox (`ENQUIRY_NOTIFICATION_TO`) receives a notification email. Replying to it goes to the customer, because Reply-To is set to their address. The sender address is always our own verified domain.

There is intentionally **no admin dashboard**: an unauthenticated one would be a liability. To view enquiries, use the database console of your PostgreSQL provider, or run `npx prisma studio` locally against a read-only connection string. If a dashboard is needed later, add it behind proper authentication (SSO or passkeys) and role checks.

Attachments live in the private bucket under the `storageKey` recorded in `EnquiryAttachment`. Download them through the storage provider's console.

## Email failure recovery

- Each enquiry is saved **before** any email is attempted. An email failure never loses a lead, and the visitor still gets their reference number.
- `emailStatus` is `SENT`, `FAILED`, `PENDING` or `NOT_CONFIGURED`. Failures record `emailAttempts`, `emailLastError` and `emailLastAttemptAt`.
- Retries are triggered after new submissions, and by the maintenance job (`/api/v1/cron/maintenance`). There is a 5-minute backoff and a maximum of 6 attempts, each enquiry is claimed atomically, and Resend idempotency keys prevent duplicate emails.
- To pause automatic retries (for example while the sender domain is being fixed), set `EMAIL_AUTO_RETRY=false`. Failed notifications are then left exactly as they are: no resend, and no change to their status, attempt count or timestamps. Retention and rate-limit cleanup still run. `/api/v1/health` reports `emailAutoRetry: "paused"`. Remove the setting, or set it to `true`, to resume. Retries are enabled when the setting is not configured.
- To find enquiries that never got through: `SELECT "referenceNumber", "createdAt", "emailLastError" FROM "Enquiry" WHERE "emailStatus" <> 'SENT' ORDER BY "createdAt" DESC;`

## Data retention and privacy

| Data | Retention | How |
| --- | --- | --- |
| Enquiries and attachments | `ENQUIRY_RETENTION_DAYS` (default 730) | Deleted by the maintenance job. An enquiry with attachments is only deleted once its files are removed from storage. |
| Rate-limit buckets (hashed IPs) | Expire within 24 hours | Purged by the maintenance job |
| Chat conversations | Not stored | Only metadata is logged (latency, token counts, outcome) |
| Application logs | Per hosting provider settings | Logs contain no message bodies, contact details or secrets |

Requests to access or delete personal data arrive by email. Locate the records by email address and delete them with `DELETE FROM "Enquiry" WHERE email = '...'` (attachments cascade in the database). Then remove the matching objects from the bucket.

## Backups and recovery

- Enable your provider's automated daily backups with point-in-time recovery, and keep at least 7 days, ideally 30.
- Test a restore at least once before launch and then quarterly: restore to a new database, point a staging deployment at it, and check `/api/v1/health`.
- The schema can always be recreated from `prisma/migrations` with `npx prisma migrate deploy`. Data can only come from backups.
- For bucket objects, enable versioning or a scheduled copy if attachments matter to the business.

## Monitoring

- Uptime: poll `GET /api/v1/health`. It returns `503` if the database is unreachable.
- Logs are single-line JSON. Watch for these events:
  - `enquiry.save_failed`
  - `enquiry.notification_failed`
  - `turnstile.not_configured`
  - `chat.provider_error`
  - `chat.rate_limit_unavailable`
  - `cron.maintenance_failed`
- Error tracking (Sentry or similar) can be added through Next.js `instrumentation.ts`. It is not configured yet.

## Rate limits (per hashed client IP)

| Endpoint | Limits |
| --- | --- |
| Enquiries | 5 per 10 minutes, 20 per day |
| Chat | 20 messages per 10 minutes, 120 per day. Fails closed if the store is unavailable, except emergency guidance, which is always returned. |
| Chat feedback | 30 per 10 minutes |

Adjust them in `src/lib/security/rate-limit.ts`.

## AI assistant

- **Provider:** chosen with `LLM_PROVIDER`, either `gemini` (key `GEMINI_API_KEY`, model `GEMINI_MODEL`, default `gemini-3.5-flash-lite`) or `anthropic` (key `LLM_API_KEY`, model `LLM_MODEL`).
- **No automatic fallback:** if the selected provider has no key or keeps failing, the chat shows its offline or "busy" state. Visitors' messages are never quietly routed to another company.
- **Gemini:** uses Google's official `@google/genai` SDK (`models.generateContent`) with JSON-schema output. Safety blocks, truncated answers and invalid JSON fall back to the safe "contact the team" reply.
- **Gemini error handling:**
  - HTTP 429, 5xx, timeouts (30 s) and network errors → "busy, try again".
  - HTTP 401/403/400/404 (bad key or unknown model) → offline.
- **Gemini data use:** use a **paid** (billing-enabled) Gemini key in production. On the free tier Google may use prompts and responses to improve its products, with human review.

- The model is set by `LLM_MODEL` and defaults to `claude-opus-5-5` at `LLM_EFFORT=low` for responsive chat. Set `LLM_MODEL=claude-haiku-5-5` for a much lower cost per message. Re-test answer quality after any change.
- Refusal fallback: for Opus 5 / 5.5, Fable 5.1 and Sonnet 5.5 models the request opts into Anthropic's server-side fallback (`fallbacks: "default"`).
- Answers are grounded only in `src/content/*`. To change what the assistant knows, edit the content files. The knowledge base is rebuilt from them automatically.
- Messages describing an active fire, smoke, gas leak, explosion or someone trapped are detected deterministically (`src/lib/ai/emergency.ts`). Those visitors get fixed "raise the alarm, evacuate, call 112" guidance and the message is never sent to the model.
