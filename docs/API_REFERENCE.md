# API reference: Safe Bharat website backend

| | |
| --- | --- |
| Document version | 1.0 |
| Prepared | 2026-10-21 |
| Applies to | Next.js 16.4.1 App Router route handlers under `src/app/api/v1/` |
| Companion documents | [`BACKEND_DEVELOPER_HANDOVER.md`](BACKEND_DEVELOPER_HANDOVER.md), [`ENVIRONMENT_CONFIGURATION.md`](ENVIRONMENT_CONFIGURATION.md) |

Every endpoint below was verified by reading its source file. These are the only six API routes in the repository. There is **no authentication system and no staff or admin API**; the only protected route is the maintenance job, which uses a shared secret.

## Conventions (all routes except `/api/v1/health`)

- **Response envelope** (`src/lib/api/response.ts`):
  - success: `{ "ok": true, "data": … }`
  - failure: `{ "ok": false, "error": { "code", "message", "fields"? } }`
- Raw exceptions, stack traces and database errors are never returned.
- Every response sets `Cache-Control: no-store`.

| Code | HTTP status | Meaning |
| --- | --- | --- |
| `VALIDATION_ERROR` | 422 | Invalid input. `fields` maps field paths to messages (`form` for request-level errors). |
| `SPAM_CHECK_FAILED` | 400 | Honeypot filled, or the Turnstile token is missing or rejected |
| `RATE_LIMITED` | 429 | Over the limit. A `Retry-After` header (seconds) is set. |
| `PAYLOAD_TOO_LARGE` | 413 | Body over the route's byte limit |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Wrong `Content-Type` |
| `SERVICE_UNAVAILABLE` | 503 | A required dependency is missing or down (database, rate-limit store, Turnstile) |
| `CHAT_UNAVAILABLE` / `CHAT_BUSY` | 503 | Assistant not configured or permanently failing / temporarily busy (`Retry-After: 20`) |
| `UNAUTHORIZED` | 401 | Cross-site `Origin`, or a missing or wrong maintenance secret |
| `INTERNAL_ERROR` | 500 | Unexpected failure (details only in server logs) |

**Origin check** (`isAllowedOrigin` in `src/lib/security/request.ts`):
- If an `Origin` header is present, it must equal the origin of `NEXT_PUBLIC_SITE_URL` or the request's own origin. Otherwise the route returns 401.
- Requests without an `Origin` header (for example server-to-server or curl) are allowed.
- This is a CSRF guard, not authentication.

**Rate limiting** (`src/lib/security/rate-limit.ts`): fixed windows stored in the PostgreSQL table `RateLimitBucket`, keyed by a SHA-256 hash of the client IP and `RATE_LIMIT_SALT`. The client IP is taken from `x-real-ip`, otherwise the first `x-forwarded-for` value.

**No CORS headers** are set on any route. The API is intended for same-origin use by the website only.

## Endpoint summary

| Method | Route | Purpose | Auth | Source |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/enquiries` | Submit a contact, quote, AMC, equipment or callback enquiry (website forms and chatbot lead capture) | None (public). Origin check, rate limit, honeypot, Turnstile. | `src/app/api/v1/enquiries/route.ts` → `src/lib/enquiries/handle-enquiry-request.ts` |
| POST | `/api/v1/chat` | AI assistant reply | None (public). Origin check, rate limit. | `src/app/api/v1/chat/route.ts` → `src/lib/ai/handle-chat-request.ts` |
| GET | `/api/v1/chat/status` | Whether the assistant is configured | None | `src/app/api/v1/chat/status/route.ts` |
| POST | `/api/v1/chat/feedback` | Anonymous helpful / not-helpful rating | None. Origin check, rate limit. | `src/app/api/v1/chat/feedback/route.ts` |
| GET | `/api/v1/health` | Readiness and configuration status | None | `src/app/api/v1/health/route.ts` |
| GET | `/api/v1/cron/maintenance` | Notification retries, retention purge, rate-limit cleanup | `Authorization: Bearer <CRON_SECRET>` | `src/app/api/v1/cron/maintenance/route.ts` |

---

## POST `/api/v1/enquiries`

The single entry point for every website form and the chatbot's lead-capture form. The browser client is `postEnquiry()` in `src/lib/client/submit-enquiry.ts`.

### Request

| Content type | Body limit | Body |
| --- | --- | --- |
| `application/json` | 32 KB | One JSON object: the envelope fields plus the payload fields for the enquiry type |
| `multipart/form-data` | 4 MB + 256 KB | Field `payload`: the same JSON object as a string. Optional field `attachment`: one file. |

**Envelope fields** (`enquiryEnvelopeSchema`, `src/lib/validation/enquiry.ts`):

| Field | Rule |
| --- | --- |
| `idempotencyKey` | Required. `^[A-Za-z0-9_-]{16,64}$`. Generated once per form by the client; resubmitting the same key returns the original enquiry. |
| `turnstileToken` | Optional string, at most 4096 characters. Required in practice whenever `TURNSTILE_SECRET_KEY` is set. |
| `source` | `WEBSITE_FORM` (default) or `CHATBOT` |
| `website` | Honeypot. Must be empty or absent. Any value → 400 `SPAM_CHECK_FAILED`, and nothing is saved. |

**Payload fields** (`enquiryPayloadSchema`, a discriminated union on `enquiryType`):
- All text is NFC-normalised and has control characters stripped, and all fields are trimmed.
- `email` is lower-cased.
- `consent` must be the literal `true`.

| Field | CONTACT | QUOTE | AMC | EQUIPMENT | CALLBACK | Rule |
| --- | --- | --- | --- | --- | --- | --- |
| `fullName` | req | req | req | req | req | ≤ 120 |
| `email` | req | req | req | req | req | valid email, ≤ 254 |
| `phone` | req | req | req | req | req | `^\+?[0-9][0-9\s-]{8,18}$` |
| `consent` | req | req | req | req | req | `true` |
| `message` | req | req | req | req | req | ≤ 4000 |
| `companyName` | opt | **req** | **req** | opt | opt | ≤ 160 |
| `serviceRequired` | opt (free text ≤ 120) | **req**: `other` or a service slug from `src/content/services.ts` | set server-side to `amc-maintenance` | – | – | |
| `jobRole` | – | opt | – | – | – | ≤ 120 |
| `siteLocation` | – | **req** | **req** | opt | – | ≤ 200 |
| `approximateScope` | – | opt | – | – | – | ≤ 500 |
| `systemType` | – | – | **req** | – | – | one of `AMC_SYSTEM_TYPES` |
| `equipmentQuantity` | – | – | **req** | opt | – | ≤ 120 |
| `currentMaintenance` | – | – | opt | – | – | ≤ 500 |
| `preferredContactMethod` | – | – | **req** | – | opt | `PHONE`, `EMAIL` or `WHATSAPP` |
| `productSlug` | – | – | – | **req** | – | a slug from `src/content/equipment.ts` |

**Attachment** (`src/lib/storage/attachments.ts`):
- At most one file, 4 MB or smaller.
- PDF, PNG or JPEG only, identified by the file's leading bytes (magic number), not by its name or MIME type.
- The file name is sanitised.
- Accepted only when attachment storage is configured (`ATTACHMENTS_*`). Otherwise the route returns 422 with `fields.attachment`.

### Processing order

1. Origin check → 401
2. Content type → 415
3. Rate limit: 5 per 10 minutes and 20 per 24 hours per hashed IP → 429. If the store is unavailable → 503 (fails closed).
4. Read the body with a hard byte limit → 413. Malformed JSON or form data → 422.
5. Envelope validation → 422
6. Honeypot → 400
7. Payload validation → 422
8. Turnstile siteverify → 400 if the token is missing or rejected; 503 if Turnstile is not configured in production, uses a test secret in production, or the verification request fails.
9. `submitEnquiry()` (`src/lib/enquiries/enquiry-service.ts`):
   1. Idempotency lookup.
   2. Optional upload to the private bucket.
   3. **Insert the `Enquiry` row.** This is the point of no data loss.
   4. Business notification email.
   5. If that succeeds, the customer acknowledgement email.
10. After a `201`, Next.js `after()` retries up to 3 older failed notifications in the background, unless `EMAIL_AUTO_RETRY=false`.

### Responses

| Status | Body `data` / error | When |
| --- | --- | --- |
| 201 | `{ referenceNumber, duplicate: false, notification: "sent" \| "queued" }` | New enquiry saved. `queued` means the email failed or is not configured; the enquiry is still saved. |
| 200 | `{ referenceNumber, duplicate: true, notification }` | Same `idempotencyKey` submitted again, including concurrent duplicates |
| 400 | `SPAM_CHECK_FAILED` | Honeypot or Turnstile rejection |
| 401 / 413 / 415 / 422 / 429 | see conventions | |
| 503 | `SERVICE_UNAVAILABLE` | Rate-limit store down, Turnstile not configured or unreachable in production, or `DATABASE_URL` missing |
| 500 | `INTERNAL_ERROR` | Database write failed (logged as `enquiry.save_failed`) |

The reference number format is `SB-YYMMDD-XXXXX`, where the date is in IST and the 5-character suffix avoids look-alike characters (`src/lib/enquiries/reference.ts`).

### Effects

- **Database:**
  - `Enquiry` insert, plus an optional `EnquiryAttachment` row;
  - `Enquiry` updates for the email outcome;
  - `RateLimitBucket` upserts.
- **Resend:**
  - a notification to `ENQUIRY_NOTIFICATION_TO`, with Resend idempotency key `notify-<enquiry id>` and Reply-To set to the customer's address;
  - then an acknowledgement to the customer if `SEND_CUSTOMER_ACKNOWLEDGEMENT` is not `false`, with key `ack-<enquiry id>`.
- **S3-compatible storage:** a `PutObject` under `enquiries/YYYY/MM/<uuid>.<ext>`. The object is deleted again if the database write fails.
- **Cloudflare:** a Turnstile siteverify request, which includes the client IP.

---

## POST `/api/v1/chat`

### Request

- **Format:** `Content-Type: application/json`, body at most 24 KB.
- **Body:** `{ "messages": [ { "role": "user" | "assistant", "content": string }, … ] }`
- **Rules** (`chatRequestSchema`, `src/lib/ai/types.ts`):
  - 1 to 12 messages, and the last must be from the user;
  - user messages up to 1000 characters, assistant messages up to 2400;
  - up to 12 000 characters in total.

### Processing order

1. Origin check → 401
2. Content type → 415
3. Body limit and JSON parsing → 413 / 422
4. Schema validation → 422
5. **Emergency detection** (`src/lib/ai/emergency.ts`): if the latest message describes an active fire, gas leak, explosion or a trapped person, the route returns fixed safety guidance immediately. There is no rate limit and no AI call for these messages.
6. Rate limit: 20 per 10 minutes and 120 per 24 hours per hashed IP → 429. If the store is unavailable → 503 `CHAT_UNAVAILABLE` (fails closed, so the paid API stays off).
7. `generateChatReply()` (`src/lib/ai/chat-service.ts`):
   1. Retrieves up to 5 knowledge documents built from `src/content/*`.
   2. Calls the provider selected by `LLM_PROVIDER` with a 30-second timeout and JSON-schema output.
   3. Validates the model's JSON.
   4. Strips markup.
   5. Blocks replies that echo the system prompt or contain an API key.
   6. Links only to retrieved documents.

### Responses

| Status | Body | When |
| --- | --- | --- |
| 200 | `{ kind: "answer" \| "emergency", reply, action, service, links: [{ label, href }] }` | `action` is one of `none`, `open_quote_form`, `open_amc_form`, `open_callback_form` or `show_contact_options`. An invalid model output becomes a fixed "contact the team" reply. |
| 503 `CHAT_UNAVAILABLE` | message with the phone number and email address | No provider key, an unknown provider, or a provider auth or bad-request error |
| 503 `CHAT_BUSY` (`Retry-After: 20`) | | Provider rate-limited or unavailable, a timeout, or a network error |
| 401 / 413 / 415 / 422 / 429 / 500 | see conventions | |

**Effects:**
- One outbound call to Google Gemini (`@google/genai`, `models.generateContent`) or Anthropic, depending on `LLM_PROVIDER`. There is no automatic fallback between providers.
- `RateLimitBucket` upserts.
- **Conversations are not stored.** Only metadata is logged: latency, token counts, provider and model.

## GET `/api/v1/chat/status`

- **Returns:** `200 { ok: true, data: { available: boolean } }`.
- **`available`:** true when the provider named in `LLM_PROVIDER` has a key.
- **Usage:** the chat panel calls this before the first message to show an honest offline state.
- **Effects:** none.

## POST `/api/v1/chat/feedback`

- **Body:** at most 512 bytes of JSON: `{ "rating": "up" | "down", "kind": "answer" | "emergency" }`. No message content is accepted.
- **Content type:** not checked; the body is parsed as JSON whatever the `Content-Type`.
- **Rate limit:** 30 per 10 minutes per hashed IP.
- **Responses:** `200 { recorded: true }`, 401, 422, 429, or 503 if the rate-limit store fails.
- **Effects:** one `chat.feedback` log line and a `RateLimitBucket` upsert. Nothing is written to any table except the rate-limit bucket.

## GET `/api/v1/health`

- **Envelope:** this route does **not** use the standard envelope.
- **Status codes:** `200` when the database answers `SELECT 1`. Otherwise `503`, with `status: "degraded"`.

```json
{
  "status": "ok",
  "checks": {
    "database": "ok | unavailable | not-configured",
    "emailAutoRetry": "enabled | paused",
    "email": "configured | sender-domain-not-verifiable | not-configured",
    "spamProtection": "configured | test-keys | not-configured",
    "assistant": "configured | not-configured",
    "assistantProvider": "gemini | anthropic | <value of LLM_PROVIDER>",
    "attachments": "configured | not-configured"
  }
}
```

**What the checks mean:**
- **Configuration status only:** it reports whether each integration is configured, never the configured values.
- **`email: "configured"` only checks configuration:** a key, a sender and a recipient are set, and the sender is not a free-mail domain. It does **not** prove that Resend accepts the sender or delivers to the recipient. See the handover, section E.
- **Public:** the route is unauthenticated and disallowed in `robots.txt` (`Disallow: /api/`).

## GET `/api/v1/cron/maintenance`

- **Auth:** the `Authorization` header must equal `Bearer <CRON_SECRET>`, compared in constant time. If the header is missing or wrong, or `CRON_SECRET` is unset, the route returns 401, so the job never runs.
- **Schedule:** `vercel.json` registers Vercel Cron at `30 2 * * *` (02:30 UTC daily; Vercel sends the secret automatically). For self-hosting, run `npm run maintenance:run`, which calls `scripts/run-maintenance.mjs`.
- **What it does** (`runMaintenance` in `src/lib/enquiries/automatic-retry.ts`):
  1. **Notification retries,** unless `EMAIL_AUTO_RETRY=false`:
     - enquiries with `emailStatus` of `PENDING`, `FAILED` or `NOT_CONFIGURED` and fewer than 6 attempts;
     - 5-minute backoff, batches of 20;
     - each enquiry is claimed with a conditional `updateMany`, so concurrent runs can't send twice.
  2. **Retention:** deletes enquiries older than `ENQUIRY_RETENTION_DAYS` (default 730), in batches of 100. An enquiry with attachments is deleted only after its files are removed from storage.
  3. **Rate-limit cleanup:** deletes `RateLimitBucket` rows that expired more than an hour ago.
- **Response:** `200 { ok: true, data: { notifications: { attempted, sent, failed, skipped? }, retention: { deleted }, purgedRateLimitBuckets } }`, or `500 INTERNAL_ERROR`.

---

## Not part of the API, but server-side

- **`src/proxy.ts`** (the Next.js 16 proxy) rewrites unknown slugs under `/services`, `/industries`, `/equipment`, `/resources` and `/projects` to a real 404.
- **`src/app/sitemap.ts` and `src/app/robots.ts`** generate the sitemap and robots.txt. Indexing is allowed only on a real `https://` production domain (`searchIndexingAllowed`, `src/lib/seo.ts`).
