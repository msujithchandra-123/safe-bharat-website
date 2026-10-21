# Launch readiness review (SEO, AEO and launch safety)

Review date: 2026-10-16. Nothing has been committed or deployed. The project folder sits inside a Git repository with no commits, so there is no history to diff against. Changes are listed by file below.

## Status: READY FOR HUMAN APPROVAL (not launch-ready)

All technical checks pass. Launch still depends on human decisions and sign-offs that no one has documented yet:
- an engineer's review of the building-standards reference and the other technical content;
- the owner's approval of the company-specific content;
- a legal review;
- the production domain;
- a verified email sending domain.

Do not launch until every **Blocking launch** item in the [checklist](#7-pre-launch-checklist-in-order) is closed.

## 1. Confirmed findings

**Verified as still correct from the previous SEO/AEO pass:**
- Unique titles and descriptions; no duplicates across the 50 public pages.
- One `h1` per page, alt text on every image, and no broken internal links.
- Unknown URLs return a real 404.
- Every page has a canonical URL, an Open Graph URL and a sharing image.
- JSON-LD types: LocalBusiness + WebSite (home), Service (service pages) and BreadcrumbList. There is no FAQPage, Product, Offer, Review or AggregateRating markup, and no prices, ratings, awards, certifications or customer counts.
- The sitemap leaves out `/api/*`, the six unapproved guides and the empty Projects page; those pages are `noindex`.
- No page claims fire suppression systems, India-wide coverage, guaranteed compliance or guaranteed safety outcomes. The one use of "suppression" is a general statement in the About page philosophy (checklist item C4).

**Defects found and fixed in this review:**

| # | Defect | Fix |
| --- | --- | --- |
| D1 | Four service pages listed "NBC 2016, Part 4" as a current reference. The Gazette of India notification CG-DL-E-30042026-272177 shows BIS withdrew SP 7:2016 on 30 April 2026, when it established SP 7:2026. | The entry now states only what the Gazette establishes and links to it. No part number is cited, because it is unverified. The FAQ answer was aligned. Engineer sign-off is still required (R1). |
| D2 | The indexing guard accepted placeholder hosts: `www.example.in` (the docs example), `.invalid`, `.test` and IP addresses. A deployment carrying a placeholder URL could have been indexed. | Such hosts now count as non-production: `noindex` everywhere and `Disallow: /`. Verified in a real build with the `.invalid` placeholder. |
| D3 | The E2E server config blanked `LLM_API_KEY` but not `GEMINI_API_KEY`, so `npm run test:e2e` could have used the real Gemini key from `.env.local` and made paid calls. | `GEMINI_API_KEY: ""` was added to the test server's environment only. `.env.local` is untouched. |
| D4 | The previous pass named "Andhra Pradesh" as a service area in structured data and in one search description, and described it as approved. Coverage beyond Visakhapatnam is an open owner decision (CONTENT_REVIEW item 9). | Structured data and that description now name only Visakhapatnam. The older site-wide wording is flagged (C3). |
| D5 | The previous report said 22 service FAQs were added. | The correct count is 21 (40 service FAQs in total). |

**Checked and found acceptable:**
- **Public build output (594 files):** no non-public value appears. The only match is the notification address, which is identical to the business email already published on the site.
- **`/api/v1/health`:** reports only whether each integration is configured, never values. It is disallowed in robots.txt.

## 2. Changes made in this review

| File | Change |
| --- | --- |
| `src/lib/seo.ts` | Stricter `searchIndexingAllowed` (placeholder, reserved and IP hosts); `areaServed` limited to Visakhapatnam; LocalBusiness no longer repeats the unconfirmed site-wide description. |
| `src/content/services.ts` | `NBC` entry replaced by `BUILDING_STANDARDS` (SP 7:2026 with the Gazette source); standards FAQ aligned; one search description narrowed to Visakhapatnam. |
| `src/types/content.ts` | Optional `source` link on a reference standard. |
| `src/app/services/[slug]/page.tsx` | Renders the standard's source link; the note now says to check the edition the local authority applies. |
| `src/content/resources.ts` | Code comment only. |
| `playwright.config.ts` | `GEMINI_API_KEY: ""` for the E2E server. |
| `tests/unit/seo.test.tsx` | Tests for placeholder and reserved hosts; URL consistency on a configured production domain; the withdrawn code no longer listed; official source required for status statements; service area. |
| `docs/CONTENT_REVIEW.md` | Pre-launch content approval checklist (R1–R4, C1–C5, F1–F22, G1–G6, L1). |
| `docs/DEPLOYMENT.md` | Indexing rules for `NEXT_PUBLIC_SITE_URL`; link to this file. |
| `docs/LAUNCH_READINESS.md` | This file. |

## 3. Test and build results (run on 2026-10-16, after the changes above)

| Check | Result |
| --- | --- |
| Lint (`npm run lint`) | Pass (exit 0) |
| TypeScript (`npm run typecheck`, `tsc --noEmit`) | Pass (exit 0) |
| Unit tests (`npm test`) | 173 passed, 9 files |
| Integration tests (`npm run test:integration`, `safebharat_test` database only) | 19 passed, 2 files |
| Production build (`npm run build`) | Pass, 69 static pages, no warnings |
| End-to-end (`npx playwright test`, test database, Turnstile test keys, email and both AI keys blanked by the config) | 57 passed |
| Crawl of the local production build | 50/50 pages 200; 43 sitemap URLs; no broken links, duplicates, missing alt text or off-origin URLs; local build `noindex` with `Disallow: /` as intended |
| Build with the `.invalid` placeholder URL | `noindex, nofollow` on every page; robots `Disallow: /` |
| Unit test with a configured `https://` production domain | robots allows `/` and blocks `/api/`; sitemap, canonical, Open Graph and JSON-LD URLs all use that one domain |

No live forms were submitted. No emails were sent and no AI APIs were called. Production data was not touched.

## 4. Regulatory claims that remain unverified

- **R1:** which part of SP 7:2026 covers fire and life safety; whether Andhra Pradesh building rules and AP Fire Services requirements apply SP 7:2026 or still refer to NBC 2016; any transition arrangement. The site states none of these.
- **R2:** the current titles and status of IS 2190, IS 15683, IS 2189, IS 13039 and IS 15105.
- **R3:** that IS 2190 and IS 2189 cover the inspection, testing and selection topics the FAQs attribute to them.
- **G4 and G5:** the emergency-number wording (112, and whether to also give the fire service number), the "must" statements about escape routes and fire doors, and the NOC description.

Official evidence used: the Gazette of India notification, <https://egazette.gov.in/WriteReadData/2026/272177.pdf>, and the BIS home page listing of SP 7:2026. Secondary commentary (for example on "Part F" or changed thresholds) was **not** relied on for any site content.

## 5. Content awaiting human approval

There are 38 items in [`CONTENT_REVIEW.md` → Pre-launch content approval checklist](CONTENT_REVIEW.md#pre-launch-content-approval-checklist), all *Pending*:
- 4 regulatory or technical references (engineer);
- 5 company claims (owner);
- 22 FAQ rows: the 21 new FAQs and their shared disclaimer (engineer and/or owner);
- 6 guides (engineer);
- 1 legal item.

The owner items in [`OWNER_APPROVAL_CHECKLIST.md`](OWNER_APPROVAL_CHECKLIST.md), such as mission and vision, service scope, Fire Crew, banner image rights and service area, also remain open.

## 6. Production environment variables

The real production domain has **not** been confirmed, so none is set anywhere. The only configured value is a local `http://localhost` address. Set these in the hosting provider, not in the repository:

| Variable | Requirement |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **Required.** The confirmed `https://` production domain, in its single canonical form (with or without `www`). It controls indexing, canonical, sitemap, Open Graph and JSON-LD URLs. The enquiry and chat cross-origin check also uses it, though it additionally accepts the request's own origin. It is fixed at build time. |
| `DATABASE_URL` | Required. Production PostgreSQL (pooled on serverless hosts); run `prisma migrate deploy` first. |
| `RESEND_API_KEY`, `EMAIL_FROM` | Required. `EMAIL_FROM` must be on a domain verified in Resend. The `onboarding@resend.dev` testing sender delivers only to the Resend account owner. |
| `ENQUIRY_NOTIFICATION_TO`, `SEND_CUSTOMER_ACKNOWLEDGEMENT` | Required; confirm the sales inbox. |
| `EMAIL_AUTO_RETRY` | Leave **unset** in production (retries enabled) once the sender is verified. It is `false` only in the local `.env.local`. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Required. Real keys for the production hostname; test keys are refused. |
| `CRON_SECRET`, `RATE_LIMIT_SALT` | Required. Long random strings. |
| `ENQUIRY_RETENTION_DAYS` | Optional (default 730); must match the privacy policy. |
| `LLM_PROVIDER` + `GEMINI_API_KEY` (or `LLM_API_KEY`) | Optional (assistant); paid tier. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`, `ATTACHMENTS_*` | Optional. |
| `ALLOW_TURNSTILE_TEST_KEYS` | **Must not be set** in any hosted environment. |
| `VERCEL_ENV` | Set automatically by Vercel; only `production` allows indexing. |

## 7. Pre-launch checklist (in order)

| # | Item | Classification |
| --- | --- | --- |
| 1 | Engineer reviews R1 (building standards: edition applied in Andhra Pradesh, part reference, appropriateness on each page) and records the decision in CONTENT_REVIEW | **Blocking launch** |
| 2 | Engineer reviews R2–R4 and the technical FAQs (F2–F9, F12, F15, F20, F22) | **Blocking launch** (shown on indexed service pages) |
| 3 | Owner approves company claims C1–C5, the company FAQs and the open OWNER_APPROVAL_CHECKLIST items, including the service-area decision (item 9) | **Blocking launch** |
| 4 | Legal adviser reviews the privacy policy and terms (L1) | **Blocking launch** |
| 5 | Confirm the production domain; verify it in Resend (SPF/DKIM) and set `EMAIL_FROM` on it | **Blocking launch** (enquiry notifications cannot reach the sales inbox otherwise) |
| 6 | Create real Turnstile keys for the production hostname | **Blocking launch** (forms fail closed without them) |
| 7 | Set all required production variables (section 6), apply migrations, deploy | Required before production deployment |
| 8 | Engineer reviews guides G1–G6, then mark each `approved` in `src/content/resources.ts` | Required before publishing the affected content (they stay `noindex` until then) |
| 9 | Add approved case studies before `/projects` is indexed; add testimonials only with permission | Required before publishing the affected content |
| 10 | Run the live-site checks below | Required immediately after production deployment |
| 11 | Decide separately what to do with the three FAILED enquiry notifications in the **local** database (they are not in production) | Required before production deployment (owner decision) |
| 12 | Restrict `/api/v1/health` detail to monitoring if preferred; a descriptive home-page `h1` (currently the slogan); remove the duplicated general FAQs on Home and Resources; sitemap `lastModified` once real dates exist | Optional improvement |

## 8. Checks on the live site after deployment

- [ ] `/robots.txt` shows `Allow: /`, `Disallow: /api/` and `Sitemap: https://<domain>/sitemap.xml`, not `Disallow: /`.
- [ ] The page source of `/`, a service page and an equipment page has no `noindex`, and `canonical`, `og:url`, `og:image` and JSON-LD URLs all use `https://<domain>`.
- [ ] `/sitemap.xml` lists only `https://<domain>` URLs, each returning 200; no `/projects`, `/resources/*` (until approved) or `/api/*`.
- [ ] `/projects` and each `/resources/*` guide still show `noindex`.
- [ ] A Vercel Preview deployment shows `Disallow: /` and `noindex`.
- [ ] `/api/v1/health` returns 200 with `database: "ok"`, `spamProtection: "configured"` and `email: "configured"`.
- [ ] The owner submits one real test enquiry. Confirm the reference number, the database row and the email in the sales inbox.
- [ ] An unknown URL (e.g. `/services/not-a-service`) returns 404.
- [ ] The home page and one service page pass the Rich Results Test and validator.schema.org without errors.
- [ ] Search Console Domain property verified and the sitemap submitted; Google Business Profile matches the site's name, address and phone numbers.
- [ ] After a few days, Search Console page indexing shows no unexpected `noindex`, canonical or 404 issues.
