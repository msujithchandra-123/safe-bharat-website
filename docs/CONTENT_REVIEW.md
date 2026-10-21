# Content review: items needing Safe Bharat confirmation

> The pre-launch approval checklist (one row per claim, with reviewer role and status) is [below](#pre-launch-content-approval-checklist). The launch status and remaining blockers are in [`LAUNCH_READINESS.md`](LAUNCH_READINESS.md). A condensed owner checklist is in [`OWNER_APPROVAL_CHECKLIST.md`](OWNER_APPROVAL_CHECKLIST.md). Image sources and licences are in [`ASSET_SOURCES.md`](ASSET_SOURCES.md).

The website only states facts taken from two sources: the official Safe Bharat banner (contact details, GSTIN, eight service lines, tagline and values) and the *Frontend Website Requirements v1.0* document. Everything else is either general industry description or draft copy. Please review the items below and confirm or correct each one.

## Verified from company material (no action needed unless incorrect)

- Name, tagline, and the values Safe People / Safe Property / Stronger Bharat.
- Phones +91 85220 21566 and +91 73861 92174; email safebharatsales@gmail.com.
- Address: Flat No. 307, Door No. 13-49/27, M K Prestige, Near Sivalayam, PM Palem, Visakhapatnam, AP 530041.
- GSTIN 37CXQPC2666B1ZH. It is displayed publicly on the banner. Confirm you want it on the website.
- Service lines: Fire Extinguishers, Fire Protection System, Fire Alarm Systems, Fire & Safety Training, Safety Audit & Consultancy, Installation/Servicing/Maintenance, Fire & Safety Equipment Supply, Fire Crew.

## Please confirm or correct

| # | Item | Where | Current treatment |
| --- | --- | --- | --- |
| 1 | Mission and vision statements | `src/content/company.ts` | Draft wording based on the brand values |
| 2 | Company overview and safety philosophy text | `src/content/company.ts` | Draft wording |
| 3 | Scope bullets for each service, e.g. refilling, addressable systems, sprinkler work, suppression | `src/content/services.ts` | General descriptions of typical scope; remove anything you don't offer |
| 4 | "Fire Crew" service description | `src/content/services.ts` | Described generically as personnel for fire watch and planned activities |
| 5 | Design and engineering capability | services, industries | Worded as "engineering input"; work done to approved drawings |
| 6 | Training certificates | training FAQ | Website does not promise certificates |
| 7 | Equipment catalogue items | `src/content/equipment.ts` | Product *types* only. No brands, prices, ratings or stock. Add verified specifications, manufacturers and datasheet PDFs when available. |
| 8 | Industries served (6 sectors) | `src/content/industries.ts` | From the master brief; remove any you do not target |
| 9 | Service area | FAQ, chatbot knowledge | "Based in Visakhapatnam; coverage confirmed per enquiry". Tell us if you serve all of AP or other states. |
| 10 | Business hours and response times | — | Not published anywhere, and the chatbot is told not to guess them |
| 11 | WhatsApp number | `NEXT_PUBLIC_WHATSAPP_NUMBER` | Hidden until you confirm which number (if any) uses WhatsApp |
| 12 | Indian Standards and the national building standards listed on service pages | `src/content/services.ts` | Shown as "codes commonly referenced", never as certification. The withdrawn "NBC 2016, Part 4" entry was corrected on 2026-10-16 from the Gazette of India notification. Remaining verification is checklist items **R1 to R4** below. |
| 13 | Privacy policy and terms | `src/content/legal.ts` | Describe what the code actually does. **Must be reviewed by a legal adviser** (e.g. against India's DPDP Act, 2023) before launch. |
| 14 | Search titles and descriptions (`seoTitle`, `seoDescription`) | `src/content/services.ts`, `src/content/industries.ts` | Written from the existing page content. They name Visakhapatnam, the verified base city; wider coverage depends on item 9. See checklist items **C1 and C2**. |
| 15 | Additional service FAQs (added October 2026) | `src/content/services.ts` | Each answer restates scope, equipment and standards text already on the site. Technical answers point to IS 2189 / IS 2190 rather than quoting intervals. See checklist items **F1 to F22**. |

## Not published until you supply them

- **Projects and case studies.** The Projects page shows "portfolio being prepared". Add only completed projects with customer approval (`src/content/projects.ts`). Tenders and bids must not be listed.
- **Testimonials.** The homepage section is hidden until genuine, permitted quotes are added (`src/content/testimonials.ts`).
- **Certifications, licences, OEM authorisations, memberships.** None are claimed. Add them with evidence.
- **Team / leadership, years in business, number of clients, statistics.** None are claimed.
- **Client and partner logos.** None are shown.
- **Project, team and site photography.** The site uses crops of the official banner plus 28 licence-verified Unsplash stock photos (see `ASSET_SOURCES.md`). Stock photos illustrate types of work and are never captioned as Safe Bharat staff or projects. Replace them with your own approved photographs where authenticity matters.

## Resources (fire safety guides)

All six articles in `src/content/resources.ts` are marked `review: { status: "pending" }`. While pending, each article shows a "general information, undergoing technical review" notice, is `noindex`, and is left out of the sitemap. After a qualified person has checked an article against current codes, set:

```ts
review: { status: "approved", reviewedBy: "Name, qualification", reviewedOn: "2026-11-01" }
```

## Pre-launch content approval checklist

Prepared on 2026-10-16. **Nothing below is approved:** no approval has been documented yet. To approve an item, change its status to *Approved* and add the approver's role, name and date in the Notes column, or link to the email or minutes that record the approval. *Needs Revision* means the reviewer asked for a change.

Type: **General** = general educational or regulatory information. **Company** = a statement about Safe Bharat's own services, scope or coverage.

Reviewer roles:
- **Owner**: Safe Bharat owner or authorised signatory.
- **Engineer**: a qualified fire-safety engineer or building-code professional familiar with Andhra Pradesh requirements.
- **Legal**: a legal adviser.

### Regulatory and technical references (high priority)

| ID | Page or content item | Exact claim | Type | Evidence or source required | Reviewer | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | Standards list on `/services/fire-protection-systems`, `/fire-alarm-systems`, `/installation-commissioning`, `/fire-safety-audits` (`BUILDING_STANDARDS` in `src/content/services.ts`); also fed to the chatbot knowledge | "SP 7:2026 — National Building Construction Standards 2026, established by BIS on 30 April 2026. BIS withdrew the National Building Code of India 2016 (SP 7:2016) on the same date." Links to the Gazette notification. | General | **Verified:** Gazette of India (Extraordinary, Part III Sec. 4), BIS notification CG-DL-E-30042026-272177 (<https://egazette.gov.in/WriteReadData/2026/272177.pdf>), read 2026-10-16: SP 7:2026 established 30 April 2026; SP 7:2016 withdrawn 30 April 2026. BIS's home page lists SP 7:2026. **Not verified, so not stated on the site:** (a) the part of SP 7:2026 covering fire and life safety ("Part F" appears only in commentary); (b) whether Andhra Pradesh building rules or AP Fire Services requirements now apply SP 7:2026 or still refer to NBC 2016; (c) any transition arrangement; (d) whether SP 7:2026 is appropriate on each of the four pages. | Engineer | **Pending (high priority, blocks launch)** | Replaces "NBC 2016, Part 4 — National Building Code of India — Fire and Life Safety". Revert by restoring that entry if the engineer decides otherwise. |
| R2 | Same pages, plus `/services/fire-extinguishers` and `/services/amc-maintenance` | IS 2190, IS 15683, IS 2189, IS 13039 and IS 15105, with the titles shown | General | BIS standard records confirming each number, title and current (not withdrawn) status. Not checked in this review. | Engineer | Pending | |
| R3 | FAQ answers on `/services/fire-extinguishers` and `/services/fire-alarm-systems` | "Inspection and maintenance of first-aid extinguishers are covered by IS 2190 and the manufacturer's instructions"; "Testing and maintenance routines are set out in IS 2189 and the manufacturer's instructions"; "IS 2189 covers their selection and installation"; "The choice for each area should follow a site assessment and IS 2190" | General | The current IS 2190 and IS 2189 texts. No intervals are quoted on the site. | Engineer | Pending | |
| R4 | `/services/fire-protection-systems` FAQ "Which standards apply to hydrant and sprinkler systems in India?" | "Commonly referenced documents include SP 7:2026, the National Building Construction Standards (established on 30 April 2026, when BIS withdrew the National Building Code of India 2016), IS 13039 … and IS 15105 … Which requirements and editions apply to your site depends on its occupancy, hazards and the local fire authority" | General | As R1 and R2 | Engineer | Pending | |

### Company-specific claims

| ID | Page or content item | Exact claim | Type | Evidence or source required | Reviewer | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C1 | Search titles and descriptions for the 9 service pages (`seoTitle`, `seoDescription`) | Most name the service with "in Visakhapatnam" (not Installation or Fire Crew). Examples: "Fire Extinguisher Supply & Refilling, Visakhapatnam"; "Fire Safety AMC & Maintenance in Visakhapatnam" | Company | The eight service lines on the official banner (already verified) and the owner's confirmation of each scope (item 3) | Owner | Pending | |
| C2 | Search titles and descriptions for the 6 industry pages | e.g. "Fire Protection for Chemical & Fertilizer Plants: hydrant and hose reel maintenance, fire crew for shutdowns, audits and extinguishers … within your permit-to-work system" | Company | Owner's confirmation that each sector is targeted (item 8) | Owner | Pending | |
| C3 | Service area: `siteConfig.description` and `serviceArea` (`src/config/site.ts`), used as the site's fallback meta description and in the chatbot | "…for industrial and commercial facilities in Visakhapatnam and Andhra Pradesh" | Company | Owner's decision on coverage (item 9). Until then, structured data names only Visakhapatnam. | Owner | Pending | No India-wide coverage is claimed anywhere. |
| C4 | About page safety philosophy (`company.safetyPhilosophy`) | "Detection, alarm, suppression, maintenance and trained people all have to work together." | General | Owner to confirm this general statement is not read as an offer of suppression systems. No suppression service is listed on any page. | Owner | Pending | |
| C5 | About page vision (draft) | "To be a trusted fire and safety partner for industry and enterprise across Bharat…" | Company | Owner approval of the draft vision (item 1). It is an aspiration, not a coverage claim. | Owner | Pending | |

### Service FAQs added in October 2026

The 19 FAQs that were already on the site before October 2026 are covered by items 3 to 6 above. (An earlier report said 22 FAQs were added; the correct count is 21.)

| ID | Service page | Question | Type | Evidence or source required | Reviewer | Status |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | Fire Extinguishers | What types of fire extinguisher do you supply? | Company | Owner confirms the four types listed | Owner | Pending |
| F2 | Fire Extinguishers | Which fire extinguisher is suitable for electrical equipment? | General | IS 2190; manufacturer guidance (see R3) | Engineer | Pending |
| F3 | Fire Extinguishers | How often do fire extinguishers need inspection and servicing? | General + Company | IS 2190 (R3); owner confirms AMC record-keeping | Engineer, Owner | Pending |
| F4 | Fire Protection Systems | What is the difference between a fire hydrant system and a sprinkler system? | General | Engineer confirms the descriptions | Engineer | Pending |
| F5 | Fire Protection Systems | What does a fire pump set do? | General + Company | Engineer; owner confirms "supplied as part of system projects" | Engineer, Owner | Pending |
| F6 | Fire Protection Systems | Which standards apply to hydrant and sprinkler systems in India? | General | R1, R2, R4 | Engineer | Pending |
| F7 | Fire Alarm Systems | What does a fire alarm system include? | General | Engineer | Engineer | Pending |
| F8 | Fire Alarm Systems | Should I use smoke detectors or heat detectors? | General | IS 2189 (R3) | Engineer | Pending |
| F9 | Fire Alarm Systems | How often should a fire alarm system be tested? | General + Company | IS 2189 (R3); owner confirms written AMC schedule and visit reports | Engineer, Owner | Pending |
| F10 | Installation & Commissioning | What does commissioning a fire protection system involve? | Company | Owner confirms the listed tests and handover documents | Owner | Pending |
| F11 | Installation & Commissioning | Can you install equipment we have already bought? | Company | Owner confirms installing procured equipment and commissioning systems installed by others | Owner | Pending |
| F12 | AMC & Maintenance | Why do fire protection systems need an AMC? | General | Engineer | Engineer | Pending |
| F13 | AMC & Maintenance | Which systems can one AMC cover? | Company | Owner confirms the four system types | Owner | Pending |
| F14 | Fire Safety Audit & Consultancy | What does a fire safety audit cover? | Company | Owner confirms audit scope | Owner | Pending |
| F15 | Fire Safety Audit & Consultancy | When should a facility have a fire safety audit? | General | Engineer | Engineer | Pending |
| F16 | Fire & Safety Training | Who should attend fire safety training? | Company | Owner confirms audiences, including contractor briefings | Owner | Pending |
| F17 | Fire & Safety Training | What does your fire safety training cover? | Company | Owner confirms topics; practical demonstration "where site conditions allow" | Owner | Pending |
| F18 | Fire & Safety Equipment Supply | What fire and safety equipment do you supply? | Company | Owner confirms the categories, and that pumps are supplied only with system projects | Owner | Pending |
| F19 | Fire & Safety Equipment Supply | Do you install the equipment you supply? | Company | Owner confirms installation is available with supply orders | Owner | Pending |
| F20 | Fire Crew | When do sites use a fire watch? | General | Engineer | Engineer | Pending |
| F21 | Fire Crew | What does a fire crew do on site? | Company | Owner confirms duties and that terms are agreed in writing (item 4) | Owner | Pending |
| F22 | All service FAQ sections | Disclaimer: "Answers about our scope describe how Safe Bharat works. Technical answers are general information: the codes that apply to your site, the manufacturer's instructions and your local fire authority take precedence." | General | Owner and engineer agree the wording | Owner, Engineer | Pending |

F1–F21 are the 21 new questions; F22 is the shared disclaimer shown above every service FAQ.

### Educational guides (`/resources/*`, all `noindex` until approved)

| ID | Guide | Claims requiring review | Type | Evidence or source required | Reviewer | Status |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | Choosing the Right Fire Extinguisher | Suitability of water, foam, ABC powder and CO₂ extinguishers; "The number, size and maximum travel distance … are set out in the applicable code of practice" | General | IS 2190, IS 15683 | Engineer | Pending |
| G2 | Fire Alarm System Maintenance: The Basics | What in-house teams can check vs. technician tasks; testing "at the intervals recommended by the applicable code and the manufacturer" | General | IS 2189 | Engineer | Pending |
| G3 | Planning an Annual Maintenance Contract | Questions to ask; record-keeping advice | General | Engineer | Engineer | Pending |
| G4 | Emergency Preparedness for Workplaces | "In India, the national emergency number is 112"; "Escape routes and exits must stay unobstructed and unlocked when the building is occupied"; "Fire doors … must not be wedged open"; "Fight a fire only if it is safe" | General | Official ERSS (112) source, and whether to also mention the fire service number; the applicable building and fire rules behind the "must" statements (R1) | Engineer | Pending |
| G5 | Industrial Fire Safety FAQs | Maintenance intervals deferred to codes; training audiences; "A No Objection Certificate is issued by the relevant fire authority" | General | AP Fire Services NOC procedure | Engineer | Pending |
| G6 | A Fire Safety Checklist for Facility Managers | Walk-round checklist items | General | Engineer | Engineer | Pending |

None of the guides or FAQs promises compliance, approval or a safety outcome. Every guide shows a "general information, undergoing technical review" notice.

### Legal

| ID | Item | Reviewer | Status |
| --- | --- | --- | --- |
| L1 | Privacy policy and terms (item 13), including the AI assistant and enquiry-retention wording | Legal | Pending |
