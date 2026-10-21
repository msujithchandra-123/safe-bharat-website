# Human approval package: Safe Bharat Fire and Safety Solutions website

Prepared: 2026-10-16. Compiled from [`CONTENT_REVIEW.md`](CONTENT_REVIEW.md), [`LAUNCH_READINESS.md`](LAUNCH_READINESS.md) and [`OWNER_APPROVAL_CHECKLIST.md`](OWNER_APPROVAL_CHECKLIST.md), plus exact wording quoted from the site content files where noted.

> **Nothing in this package is approved.** Every decision is *Pending*. The website is **not launch-ready**. This package does not contact any reviewer. Each reviewer records their decision in the [approval register](#7-approval-register) (section 7). The 38-item checklist in `CONTENT_REVIEW.md` remains the master list, and its items are reproduced here unchanged.

**How to use this package**

| Reviewer role | Read | Records decisions in |
| --- | --- | --- |
| **Engineer**: a qualified fire-safety engineer or building-code professional familiar with Andhra Pradesh requirements | Sections 1, 2 and 3 | Register rows R1–R4, F (technical), G1–G6 |
| **Owner**: Safe Bharat owner or authorised signatory | Sections 1 and 4 | Register rows C1–C5, F (company), O-rows, M1 |
| **Legal**: a legal adviser | Sections 1 and 5 | Register row L1 |
| **Developer**: the person deploying the site | Sections 1 and 6 | Register D-rows, after all other approvals |

---

## 1. Project status and latest reported validation results

**Status: READY FOR HUMAN APPROVAL (not launch-ready).** The technical checks reported below passed. Launch still needs these sign-offs and decisions:
- engineer, owner and legal sign-off;
- a confirmed production domain;
- a verified email sending domain;
- production Turnstile keys.

**Latest reported validation results.** These come from `LAUNCH_READINESS.md` §3, run on 2026-10-16. They were **not re-run** for this package, which changes documentation only. File timestamps show no application code has changed since that run.

| Check | Reported result |
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

> **What these results do and do not show.** The tests confirm that the software behaves as designed, for example that pages render, forms save to the test database, and search-engine controls work. **They do not establish that any regulatory, technical, legal or company statement on the site is correct, current or complete.** Only the reviewers named in this package can confirm that.

## 2. Sources: official evidence, secondary commentary and unresolved interpretations

### 2.1 Confirmed official sources (read on 2026-10-16)

| Source | What it establishes | Limits |
| --- | --- | --- |
| Gazette of India, Extraordinary, Part III Sec. 4: BIS notification CG-DL-E-30042026-272177, dated 30 April 2026 (<https://egazette.gov.in/WriteReadData/2026/272177.pdf>) | Schedule row 1: **SP 7 : 2026, National Building Construction Standards 2026**, established **30 April 2026**. **SP 7 : 2016, National Building Code of India 2016**, withdrawn **30 April 2026**. Issued under Rule 15(1) of the BIS Rules, 2018. | Says nothing about part numbering, state adoption, the Andhra Pradesh position or transition arrangements beyond the withdrawal date. |
| BIS website (the page served at <https://www.bis.gov.in/standards/technical-department/national-building-code/>) | Lists "National Building Construction Standards 2026" (Hindi heading) with a "New" marker and a link to the SP 7:2026 standard record; its menu labels the same link "NBC 2026". | No description, status or date on the page. The SP 7:2026 standard-record page could not be read (it returned only a title). |

### 2.2 Secondary commentary (not relied on for any site content)

These sources discuss SP 7:2026 but are not official. Nothing on the website depends on them:
- [flaresens.in](https://flaresens.in/blog/nbcs-2026-part-f-compliance-guide)
- [securityupdate.in](https://securityupdate.in/nbcs-2026-indias-new-building-standards-trigger-debate-over-fire-life-safety/)
- [safesecuremagazine.com](https://safesecuremagazine.com/editorial/expert-talks/nbc-2016-and-sp7-nbcs-2026-implementation-by-dr-arindam-bhadra)
- [agileregulatory.com](https://www.agileregulatory.com/latest-updates/bis-update-2026-national-building-code-2016-replaced-by-sp-7-2026)
- [ResearchGate paper](https://www.researchgate.net/publication/410488211_Withdrawal_of_the_National_Building_Code_and_introduction_of_the_National_Building_Construction_Standards_in_India_An_analysis_of_drivers_structural_changes_and_implications)
- [ulba.in](https://ulba.in/national-building-construction-standards-2026-sp-72026)
- [nammaward.in](https://nammaward.in/nammaward-update-nbc-2026-notified-gazette-standards-document-released/)
- [uncomplycate.com (PDF)](https://uncomplycate.com/wp-content/uploads/2026/05/Uncomplycate-Compliance-Update-May-Part-1-of-2.pdf)
- [brgbuildingsolutions.com](https://news.brgbuildingsolutions.com/post/india-replaces-nbc-2016-with-nbc-2026)
- [sitesetu.app](https://sitesetu.app/blog/nbcs-2026-national-building-construction-standards-india-guide)
- [gazettetracker.com](https://gazettetracker.com/g/CG-DL-E-30042026-272177) (a mirror; the official Gazette PDF above was read directly)

A Goa Department of Fire & Emergency Services PDF that appears to reproduce the fire part of SP 7:2026 (<https://dfes.goa.gov.in/wp-content/uploads/2026/05/sp7_2026_nbcs-212-1480.pdf>) was found, but its text could not be extracted, so its contents are **unverified**.

### 2.3 Unresolved interpretations (none is stated on the website)

- That fire and life safety now sits in "**Part F**" of SP 7:2026 (secondary sources only).
- Whether **Andhra Pradesh** building rules and **AP Fire Services** requirements apply SP 7:2026, or still refer to NBC 2016.
- Any **transition arrangement** for projects designed under NBC 2016.
- Reported changes such as a **high-rise threshold moving from 15 m to 24 m** (secondary sources only, described there as "reportedly").
- Claims that SP 7:2026 is **voluntary or advisory** until adopted by a state or local authority (secondary sources disagree).
- Whether SP 7:2026 is formally called "NBC 2026": BIS's menu uses that label, but the Gazette title is "National Building Construction Standards 2026".

---

## 3. Technical review: Engineer

**Purpose:** confirm, correct or reject each technical and regulatory statement before it goes live. Items R1–R4 and the technical FAQs appear on indexed service pages and are **blocking launch**. Guides G1–G6 are already `noindex`, with a review notice; they are required before those guides are published to search engines.

### 3.1 Items R1–R4 (reproduced exactly from `CONTENT_REVIEW.md`)

| ID | Page or content item | Exact claim | Type | Evidence or source required | Reviewer | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | Standards list on `/services/fire-protection-systems`, `/fire-alarm-systems`, `/installation-commissioning`, `/fire-safety-audits` (`BUILDING_STANDARDS` in `src/content/services.ts`); also fed to the chatbot knowledge | "SP 7:2026 — National Building Construction Standards 2026, established by BIS on 30 April 2026. BIS withdrew the National Building Code of India 2016 (SP 7:2016) on the same date." Links to the Gazette notification. | General | **Verified:** Gazette of India (Extraordinary, Part III Sec. 4), BIS notification CG-DL-E-30042026-272177 (<https://egazette.gov.in/WriteReadData/2026/272177.pdf>), read 2026-10-16: SP 7:2026 established 30 April 2026; SP 7:2016 withdrawn 30 April 2026. BIS's home page lists SP 7:2026. **Not verified, so not stated on the site:** (a) the part of SP 7:2026 covering fire and life safety ("Part F" appears only in commentary); (b) whether Andhra Pradesh building rules or AP Fire Services requirements now apply SP 7:2026 or still refer to NBC 2016; (c) any transition arrangement; (d) whether SP 7:2026 is appropriate on each of the four pages. | Engineer | **Pending (high priority, blocks launch)** | Replaces "NBC 2016, Part 4 — National Building Code of India — Fire and Life Safety". Revert by restoring that entry if the engineer decides otherwise. |
| R2 | Same pages, plus `/services/fire-extinguishers` and `/services/amc-maintenance` | IS 2190, IS 15683, IS 2189, IS 13039 and IS 15105, with the titles shown | General | BIS standard records confirming each number, title and current (not withdrawn) status. Not checked in this review. | Engineer | Pending | |
| R3 | FAQ answers on `/services/fire-extinguishers` and `/services/fire-alarm-systems` | "Inspection and maintenance of first-aid extinguishers are covered by IS 2190 and the manufacturer's instructions"; "Testing and maintenance routines are set out in IS 2189 and the manufacturer's instructions"; "IS 2189 covers their selection and installation"; "The choice for each area should follow a site assessment and IS 2190" | General | The current IS 2190 and IS 2189 texts. No intervals are quoted on the site. | Engineer | Pending | |
| R4 | `/services/fire-protection-systems` FAQ "Which standards apply to hydrant and sprinkler systems in India?" | "Commonly referenced documents include SP 7:2026, the National Building Construction Standards (established on 30 April 2026, when BIS withdrew the National Building Code of India 2016), IS 13039 … and IS 15105 … Which requirements and editions apply to your site depends on its occupancy, hazards and the local fire authority" | General | As R1 and R2 | Engineer | Pending | |

**For R2: the standard titles as currently shown on the site** (quoted from `src/content/services.ts`; this adds no claims):

| Code | Title shown | Pages |
| --- | --- | --- |
| IS 2190 | Selection, installation and maintenance of first-aid fire extinguishers — Code of practice | Fire Extinguishers, AMC & Maintenance |
| IS 15683 | Portable fire extinguishers — Performance and construction — Specification | Fire Extinguishers |
| IS 2189 | Selection, installation and maintenance of automatic fire detection and alarm system — Code of practice | Fire Alarm Systems, AMC & Maintenance |
| IS 13039 | External hydrant systems — Provision and maintenance — Code of practice | Fire Protection Systems |
| IS 15105 | Design and installation of fixed automatic sprinkler fire extinguishing systems — Specification | Fire Protection Systems |

The service pages present these under the heading "Codes commonly referenced in India", with this note: "Which requirements apply depends on the occupancy, the hazards and the local fire authority. We confirm the applicable requirements for each project. This list is general information, not a statement of certification." A source line adds: "Check the current edition, any amendments and the edition your local authority applies before relying on a clause."

### 3.2 Questions requiring the engineer's confirmation

| Ref | Question |
| --- | --- |
| R1-Q1 | Is it accurate and appropriate to list SP 7:2026 as a "code commonly referenced in India" on each of the four pages (fire protection systems, fire alarm systems, installation & commissioning, fire safety audits)? |
| R1-Q2 | Which edition do Andhra Pradesh building rules and AP Fire Services currently apply or reference: SP 7:2026, NBC 2016, or both during a transition? Please cite the source. |
| R1-Q3 | Should the site cite a specific part of SP 7:2026 for fire and life safety? If so, which part, confirmed from the BIS text? |
| R1-Q4 | Should the site keep, change or remove the sentence "BIS withdrew the National Building Code of India 2016 (SP 7:2016) on the same date"? |
| R2-Q1 | For each of IS 2190, IS 15683, IS 2189, IS 13039 and IS 15105: is the number and title correct, and is the standard current (not withdrawn or superseded)? Should a year or edition be shown? |
| R3-Q1 | Do IS 2190 and IS 2189 cover the inspection, maintenance, testing and selection topics the FAQ answers attribute to them? |
| R4-Q1 | Is the answer to "Which standards apply to hydrant and sprinkler systems in India?" accurate and complete enough for a general answer? |
| F-Q1 | Are the technical FAQ answers in §3.3 accurate as general information, without implying compliance? |
| G-Q1 | For each guide G1–G6: approve, revise or withdraw? If approved, give the name, qualification and date to publish as the reviewer (the site shows "Reviewed by … on …"). |

### 3.3 Technical FAQ answers for review (exact current text from `src/content/services.ts`)

These are the FAQ rows assigned to the Engineer in `CONTENT_REVIEW.md` (F2–F9, F12, F15, F20 and the disclaimer F22). Rows marked "Engineer, Owner" also need the owner's confirmation of the company statement (section 4).

Checklist rows (reproduced exactly from `CONTENT_REVIEW.md`):

| ID | Service page | Question | Type | Evidence or source required | Reviewer | Status |
| --- | --- | --- | --- | --- | --- | --- |
| F2 | Fire Extinguishers | Which fire extinguisher is suitable for electrical equipment? | General | IS 2190; manufacturer guidance (see R3) | Engineer | Pending |
| F3 | Fire Extinguishers | How often do fire extinguishers need inspection and servicing? | General + Company | IS 2190 (R3); owner confirms AMC record-keeping | Engineer, Owner | Pending |
| F4 | Fire Protection Systems | What is the difference between a fire hydrant system and a sprinkler system? | General | Engineer confirms the descriptions | Engineer | Pending |
| F5 | Fire Protection Systems | What does a fire pump set do? | General + Company | Engineer; owner confirms "supplied as part of system projects" | Engineer, Owner | Pending |
| F6 | Fire Protection Systems | Which standards apply to hydrant and sprinkler systems in India? | General | R1, R2, R4 | Engineer | Pending |
| F7 | Fire Alarm Systems | What does a fire alarm system include? | General | Engineer | Engineer | Pending |
| F8 | Fire Alarm Systems | Should I use smoke detectors or heat detectors? | General | IS 2189 (R3) | Engineer | Pending |
| F9 | Fire Alarm Systems | How often should a fire alarm system be tested? | General + Company | IS 2189 (R3); owner confirms written AMC schedule and visit reports | Engineer, Owner | Pending |
| F12 | AMC & Maintenance | Why do fire protection systems need an AMC? | General | Engineer | Engineer | Pending |
| F15 | Fire Safety Audit & Consultancy | When should a facility have a fire safety audit? | General | Engineer | Engineer | Pending |
| F20 | Fire Crew | When do sites use a fire watch? | General | Engineer | Engineer | Pending |
| F22 | All service FAQ sections | Disclaimer: "Answers about our scope describe how Safe Bharat works. Technical answers are general information: the codes that apply to your site, the manufacturer's instructions and your local fire authority take precedence." | General | Owner and engineer agree the wording | Owner, Engineer | Pending |

Current answer text:

| ID | Question | Current answer (verbatim) | Reviewer per checklist |
| --- | --- | --- | --- |
| F2 | Which fire extinguisher is suitable for electrical equipment? | CO₂ extinguishers are often chosen for electrical rooms, control panels and server areas because they leave no residue. Water-type extinguishers are not suitable for energised electrical equipment. CO₂ displaces oxygen, so units should be positioned and used with care in small, enclosed spaces. The choice for each area should follow a site assessment and IS 2190. | Engineer |
| F3 | How often do fire extinguishers need inspection and servicing? | Inspection and maintenance of first-aid extinguishers are covered by IS 2190 and the manufacturer's instructions. Under an Annual Maintenance Contract we agree the inspection and servicing schedule with you and record the status of every unit. | Engineer, Owner |
| F4 | What is the difference between a fire hydrant system and a sprinkler system? | A hydrant system provides outlets, called landing valves, that firefighting hoses connect to, so trained people can fight a fire with a large water supply. A first-aid hose reel gives trained occupants a smaller, continuous supply for early firefighting. A sprinkler system is automatic: sprinkler heads on the pipe network discharge water over the fire area without anyone operating them. Many larger sites use more than one. | Engineer |
| F5 | What does a fire pump set do? | A fire pump set supplies the water pressure for hydrant and sprinkler systems. Whether a system needs its own pumps, and their size, is decided in the system design. We supply pump sets as part of system projects. | Engineer, Owner |
| F6 | Which standards apply to hydrant and sprinkler systems in India? | Commonly referenced documents include SP 7:2026, the National Building Construction Standards (established on 30 April 2026, when BIS withdrew the National Building Code of India 2016), IS 13039 for external hydrant systems and IS 15105 for sprinkler systems. Which requirements and editions apply to your site depends on its occupancy, hazards and the local fire authority, and we confirm them for each project. | Engineer |
| F7 | What does a fire alarm system include? | A fire detection and alarm system is a network of automatic detectors, manual call points, sounders or strobes and a control panel that monitors them. Placement, wiring, programming and regular testing decide how reliable it is. | Engineer |
| F8 | Should I use smoke detectors or heat detectors? | Smoke detectors give early warning of smouldering and flaming fires and suit areas such as offices, corridors and server rooms. Heat detectors are used where smoke detectors could cause false alarms, such as kitchens and some process areas. Detector type and spacing depend on the room height, use and environment. IS 2189 covers their selection and installation. | Engineer |
| F9 | How often should a fire alarm system be tested? | Testing and maintenance routines are set out in IS 2189 and the manufacturer's instructions. Under an AMC we agree the schedule in writing and give you a report after each visit. | Engineer, Owner |
| F12 | Why do fire protection systems need an AMC? | Fire protection equipment is rarely used, so faults can go unnoticed until an emergency. An Annual Maintenance Contract gives you planned inspection and servicing that finds those faults first, and consistent records for audits and inspections. | Engineer |
| F15 | When should a facility have a fire safety audit? | Common triggers are before upgrading fire protection, before a customer, insurer or internal inspection, and after a change in process, storage or layout. Fire risk changes as facilities change, so periodic audits check that protection has kept up. | Engineer |
| F20 | When do sites use a fire watch? | Fire watch is commonly arranged for activities that raise fire risk for a period, such as plant shutdowns, maintenance turnarounds, hot work and large planned events. Your permit-to-work system and site rules decide when it is required. | Engineer |
| F22 | (Disclaimer above every service FAQ) | Answers about our scope describe how Safe Bharat works. Technical answers are general information: the codes that apply to your site, the manufacturer's instructions and your local fire authority take precedence. | Owner, Engineer |

### 3.4 Educational guides G1–G6 (reproduced exactly from `CONTENT_REVIEW.md`)

The full guide text is in `src/content/resources.ts` and at `/resources/<slug>` on a local build.

| ID | Guide | Claims requiring review | Type | Evidence or source required | Reviewer | Status |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | Choosing the Right Fire Extinguisher | Suitability of water, foam, ABC powder and CO₂ extinguishers; "The number, size and maximum travel distance … are set out in the applicable code of practice" | General | IS 2190, IS 15683 | Engineer | Pending |
| G2 | Fire Alarm System Maintenance: The Basics | What in-house teams can check vs. technician tasks; testing "at the intervals recommended by the applicable code and the manufacturer" | General | IS 2189 | Engineer | Pending |
| G3 | Planning an Annual Maintenance Contract | Questions to ask; record-keeping advice | General | Engineer | Engineer | Pending |
| G4 | Emergency Preparedness for Workplaces | "In India, the national emergency number is 112"; "Escape routes and exits must stay unobstructed and unlocked when the building is occupied"; "Fire doors … must not be wedged open"; "Fight a fire only if it is safe" | General | Official ERSS (112) source, and whether to also mention the fire service number; the applicable building and fire rules behind the "must" statements (R1) | Engineer | Pending |
| G5 | Industrial Fire Safety FAQs | Maintenance intervals deferred to codes; training audiences; "A No Objection Certificate is issued by the relevant fire authority" | General | AP Fire Services NOC procedure | Engineer | Pending |
| G6 | A Fire Safety Checklist for Facility Managers | Walk-round checklist items | General | Engineer | Engineer | Pending |

**What the engineer needs to return:** a decision (Approved / Needs Revision / Rejected) for each of R1–R4, the engineer-assigned F rows and G1–G6; corrected wording wherever a revision is needed; and the sources relied on.

---

## 4. Owner review: Owner

**Purpose:** confirm that every statement about Safe Bharat's own services, scope, coverage and positioning is true, and approve the draft company wording.

### 4.1 Company-specific claims C1–C5 (reproduced exactly from `CONTENT_REVIEW.md`)

| ID | Page or content item | Exact claim | Type | Evidence or source required | Reviewer | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C1 | Search titles and descriptions for the 9 service pages (`seoTitle`, `seoDescription`) | Most name the service with "in Visakhapatnam" (not Installation or Fire Crew). Examples: "Fire Extinguisher Supply & Refilling, Visakhapatnam"; "Fire Safety AMC & Maintenance in Visakhapatnam" | Company | The eight service lines on the official banner (already verified) and the owner's confirmation of each scope (item 3) | Owner | Pending | |
| C2 | Search titles and descriptions for the 6 industry pages | e.g. "Fire Protection for Chemical & Fertilizer Plants: hydrant and hose reel maintenance, fire crew for shutdowns, audits and extinguishers … within your permit-to-work system" | Company | Owner's confirmation that each sector is targeted (item 8) | Owner | Pending | |
| C3 | Service area: `siteConfig.description` and `serviceArea` (`src/config/site.ts`), used as the site's fallback meta description and in the chatbot | "…for industrial and commercial facilities in Visakhapatnam and Andhra Pradesh" | Company | Owner's decision on coverage (item 9). Until then, structured data names only Visakhapatnam. | Owner | Pending | No India-wide coverage is claimed anywhere. |
| C4 | About page safety philosophy (`company.safetyPhilosophy`) | "Detection, alarm, suppression, maintenance and trained people all have to work together." | General | Owner to confirm this general statement is not read as an offer of suppression systems. No suppression service is listed on any page. | Owner | Pending | |
| C5 | About page vision (draft) | "To be a trusted fire and safety partner for industry and enterprise across Bharat…" | Company | Owner approval of the draft vision (item 1). It is an aspiration, not a coverage claim. | Owner | Pending | |

### 4.2 Company FAQs (reproduced exactly from `CONTENT_REVIEW.md`)

| ID | Service page | Question | Type | Evidence or source required | Reviewer | Status |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | Fire Extinguishers | What types of fire extinguisher do you supply? | Company | Owner confirms the four types listed | Owner | Pending |
| F3 | Fire Extinguishers | How often do fire extinguishers need inspection and servicing? | General + Company | IS 2190 (R3); owner confirms AMC record-keeping | Engineer, Owner | Pending |
| F5 | Fire Protection Systems | What does a fire pump set do? | General + Company | Engineer; owner confirms "supplied as part of system projects" | Engineer, Owner | Pending |
| F9 | Fire Alarm Systems | How often should a fire alarm system be tested? | General + Company | IS 2189 (R3); owner confirms written AMC schedule and visit reports | Engineer, Owner | Pending |
| F10 | Installation & Commissioning | What does commissioning a fire protection system involve? | Company | Owner confirms the listed tests and handover documents | Owner | Pending |
| F11 | Installation & Commissioning | Can you install equipment we have already bought? | Company | Owner confirms installing procured equipment and commissioning systems installed by others | Owner | Pending |
| F13 | AMC & Maintenance | Which systems can one AMC cover? | Company | Owner confirms the four system types | Owner | Pending |
| F14 | Fire Safety Audit & Consultancy | What does a fire safety audit cover? | Company | Owner confirms audit scope | Owner | Pending |
| F16 | Fire & Safety Training | Who should attend fire safety training? | Company | Owner confirms audiences, including contractor briefings | Owner | Pending |
| F17 | Fire & Safety Training | What does your fire safety training cover? | Company | Owner confirms topics; practical demonstration "where site conditions allow" | Owner | Pending |
| F18 | Fire & Safety Equipment Supply | What fire and safety equipment do you supply? | Company | Owner confirms the categories, and that pumps are supplied only with system projects | Owner | Pending |
| F19 | Fire & Safety Equipment Supply | Do you install the equipment you supply? | Company | Owner confirms installation is available with supply orders | Owner | Pending |
| F21 | Fire Crew | What does a fire crew do on site? | Company | Owner confirms duties and that terms are agreed in writing (item 4) | Owner | Pending |
| F22 | All service FAQ sections | Disclaimer: "Answers about our scope describe how Safe Bharat works. Technical answers are general information: the codes that apply to your site, the manufacturer's instructions and your local fire authority take precedence." | General | Owner and engineer agree the wording | Owner, Engineer | Pending |

The full answer text is on each service page and in `src/content/services.ts`. The 19 FAQs published before October 2026 fall under `CONTENT_REVIEW.md` items 3 to 6.

### 4.3 Owner decisions already listed in `OWNER_APPROVAL_CHECKLIST.md` (section B, unchanged)

| # | Decision | Launch blocker (as stated in that file) |
| --- | --- | --- |
| 1 | Approve or rewrite the mission and vision (currently drafts) | Yes |
| 2 | Confirm the scope bullets for each service, and remove anything you don't do (e.g. addressable systems, sprinkler installation, refilling) | Yes |
| 3 | Describe what Fire Crew covers | Yes |
| 4 | Confirm the six industries you target | No |
| 5 | Confirm your service area (Visakhapatnam only, all of Andhra Pradesh, other states?) | No (see the inconsistency noted in section 8) |
| 6 | Give the WhatsApp number, if any | No |
| 7 | Confirm you are happy to show the GSTIN publicly | No |
| 8 | Confirm the banner's photographs are licensed for web use | Yes |
| 9 | Approve the stock photo selection (28 Unsplash photos, licence verified) | No |
| 10 | Supply product photos (your own, or manufacturer images with written permission) | No |
| 11 | Supply completed projects (with customer approval), testimonials (with permission), certifications/licences (with evidence), team photos | No |
| 12 | Have a qualified fire safety professional review the six guides | No (guides stay `noindex`) |
| 13 | Have a lawyer review the Privacy Policy and Terms | Yes (section 5) |
| 14 | Confirm the data retention period (currently 24 months) | No |
| 15 | Confirm the inbox that receives enquiries (`ENQUIRY_NOTIFICATION_TO`) | Yes |

### 4.4 Marketing claims not covered by the 38-item checklist (added to this package as M1)

These statements appear on the home and About pages (`src/content/company.ts`). `CONTENT_REVIEW.md` item 2 covers the overview and safety philosophy, but the following positioning statements have no item of their own. They are listed here so the owner can confirm each one is true.

- "Why Safe Bharat":
  - "Engineering-led approach: Recommendations start from a site survey and the actual hazards, not a standard product list."
  - "End-to-end capability: Equipment supply, installation, commissioning, maintenance and training from one accountable team."
  - "Quality-focused execution: Careful installation, testing before handover and clear documentation of what was done."
  - "Reliable service: Planned maintenance and AMCs that keep systems ready, with reports you can file and act on."
  - "Safety-first team: Work planned around your permit-to-work and site safety rules from the first visit."
- Home page heading "Engineering discipline. Honest advice."
- The lifecycle strip "Survey → Design → Supply → Installation → Testing → Maintenance → Training". Note that "Design" relates to item 5 (design and engineering capability).
- Brand message "Protecting People. Protecting Property. Protecting Operations."

The tagline and values are already verified from the official banner and need no action.

---

## 5. Legal review: Legal

### 5.1 Item L1 (reproduced exactly from `CONTENT_REVIEW.md`)

| ID | Item | Reviewer | Status |
| --- | --- | --- | --- |
| L1 | Privacy policy and terms (item 13), including the AI assistant and enquiry-retention wording | Legal | Pending |

`CONTENT_REVIEW.md` item 13: "Describe what the code actually does. **Must be reviewed by a legal adviser** (e.g. against India's DPDP Act, 2023) before launch."

### 5.2 Scope of the review

| Document | Location | Last updated (as shown) | Sections |
| --- | --- | --- | --- |
| Privacy Policy | `/privacy-policy` · `src/content/legal.ts` | 15 October 2026; notice version `2026-10` (stored with each consent) | Who we are; Information we collect; How we use it; Service providers; AI assistant; How long we keep it; Your choices and rights; Security; Changes to this notice |
| Terms of Use | `/terms` · `src/content/legal.ts` | 15 October 2026 | About these terms; Information on this website; Not an emergency service; AI assistant; Acceptable use; Intellectual property; Liability; Governing law; Contact |

Points that depend on configuration or on owner decisions:
- **Retention:** "kept for up to 24 months" is generated from `ENQUIRY_RETENTION_DAYS` (default 730). The owner must confirm the period (owner decision 14), and the production setting must match it.
- **Service providers named:** website and database hosting (provider not yet chosen), Resend (email), Cloudflare Turnstile (spam protection), the AI assistant provider, whose name is generated from the configured provider (for example "Google (Gemini API)"), and an optional private storage bucket. The text says "Some of these providers may process data outside India."
- **AI assistant statements:** "Conversation text is not saved to our database. Only operational metadata such as response time and error codes is logged." These describe the current code. The legal adviser should confirm the wording is adequate, not whether the code does this.
- **Governing law:** "These terms are governed by the laws of India. Courts at Visakhapatnam, Andhra Pradesh, have jurisdiction, subject to applicable law."

### 5.3 Questions for the legal adviser

| Ref | Question |
| --- | --- |
| L1-Q1 | Is the privacy notice, and the consent captured with each enquiry (notice version and date), adequate under the Digital Personal Data Protection Act, 2023 and any rules in force? What must change? |
| L1-Q2 | Is the disclosure of service providers, including possible processing outside India, sufficient? Must each provider be named once hosting is chosen? |
| L1-Q3 | Is the proposed retention period acceptable, and is the wording on longer retention ("ongoing contract or a legal obligation") adequate? |
| L1-Q4 | Are the AI assistant disclaimers and the "Not an emergency service" wording in the terms adequate? |
| L1-Q5 | Are the liability, intellectual property and governing-law clauses acceptable for Safe Bharat? |
| L1-Q6 | Should the site publish GSTIN 37CXQPC2666B1ZH, as it currently does (owner decision 7)? Is any other business identification required on the site? |

---

## 6. Developer deployment section: Developer

**Do not deploy until every Engineer, Owner and Legal row in the approval register is decided.** The values below are set in the hosting provider, never in the repository. No real production domain has been confirmed; the only configured value is a local `http://localhost` address.

### 6.1 Required production configuration (from `LAUNCH_READINESS.md` §6)

| Variable | Requirement |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **Required.** The confirmed `https://` production domain, in its single canonical form (with or without `www`). It controls indexing, canonical, sitemap, Open Graph and JSON-LD URLs. The enquiry and chat cross-origin check also uses it, though it additionally accepts the request's own origin. It is fixed at build time. The site stays `noindex` with robots `Disallow: /` if this is missing, uses `http://`, or points to `localhost`, an `example.*` placeholder, a reserved test name (`.invalid`, `.test`, `.example`, `.local`, `.internal`) or an IP address. |
| `DATABASE_URL` | Required. Production PostgreSQL (pooled on serverless hosts); run `prisma migrate deploy` first. |
| `RESEND_API_KEY`, `EMAIL_FROM` | Required. **`EMAIL_FROM` must be on a domain verified in Resend (SPF/DKIM DNS records).** The `onboarding@resend.dev` testing sender delivers only to the Resend account owner, so enquiry notifications would not reach the sales inbox. |
| `ENQUIRY_NOTIFICATION_TO`, `SEND_CUSTOMER_ACKNOWLEDGEMENT` | Required; confirm the sales inbox (owner decision 15). |
| `EMAIL_AUTO_RETRY` | Leave **unset** in production (retries enabled) once the sender is verified. It is `false` only in the local `.env.local`. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Required. **Real Cloudflare Turnstile keys for the production hostname.** Test keys are refused in production, and forms fail closed without real keys. |
| `CRON_SECRET`, `RATE_LIMIT_SALT` | Required. Long random strings. |
| `ENQUIRY_RETENTION_DAYS` | Optional (default 730); must match the privacy policy (section 5). |
| `LLM_PROVIDER` + `GEMINI_API_KEY` (or `LLM_API_KEY`) | Optional (assistant); paid tier. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`, `ATTACHMENTS_*` | Optional. |
| `ALLOW_TURNSTILE_TEST_KEYS` | **Must not be set** in any hosted environment. |
| `VERCEL_ENV` | Set automatically by Vercel; only `production` allows indexing. |

The step-by-step procedure is in [`DEPLOYMENT.md`](DEPLOYMENT.md). Run the checks on the live site after deployment from [`LAUNCH_READINESS.md` §8](LAUNCH_READINESS.md#8-checks-on-the-live-site-after-deployment).

### 6.2 Open deployment decisions

- Production domain: not confirmed.
- Hosting provider: Vercel is recommended in `DEPLOYMENT.md`, but not confirmed.
- Production PostgreSQL provider and backups: not chosen.
- The three FAILED enquiry notifications in the **local** database: an owner decision is needed (`LAUNCH_READINESS.md` §7, item 11).

---

## 7. Approval register

Instructions:
- Fill in **Decision** (Approved / Needs Revision / Rejected), **Date**, **Comments** and **Evidence** (the source relied on, or a link to the email or minutes), plus the reviewer's name next to the role.
- Then copy the outcome to the matching row in `CONTENT_REVIEW.md`.
- Every decision below is **Pending**.

| ID | Item | Reviewer role (name) | Decision | Date | Comments | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | National building standards reference (SP 7:2026 / NBC 2016) | Engineer ( ) | Pending | | | |
| R2 | IS 2190, IS 15683, IS 2189, IS 13039, IS 15105 numbers, titles and status | Engineer ( ) | Pending | | | |
| R3 | FAQ statements attributing topics to IS 2190 / IS 2189 | Engineer ( ) | Pending | | | |
| R4 | FAQ "Which standards apply to hydrant and sprinkler systems in India?" | Engineer ( ) | Pending | | | |
| C1 | Service search titles and descriptions | Owner ( ) | Pending | | | |
| C2 | Industry search titles and descriptions | Owner ( ) | Pending | | | |
| C3 | Service area wording ("Visakhapatnam and Andhra Pradesh") | Owner ( ) | Pending | | | |
| C4 | Safety philosophy wording mentioning "suppression" | Owner ( ) | Pending | | | |
| C5 | Draft vision ("across Bharat") | Owner ( ) | Pending | | | |
| F1 | Extinguisher types supplied | Owner ( ) | Pending | | | |
| F2 | Extinguisher for electrical equipment | Engineer ( ) | Pending | | | |
| F3 | Extinguisher inspection and servicing | Engineer ( ), Owner ( ) | Pending | | | |
| F4 | Hydrant vs sprinkler systems | Engineer ( ) | Pending | | | |
| F5 | Fire pump sets | Engineer ( ), Owner ( ) | Pending | | | |
| F6 | Standards for hydrant and sprinkler systems | Engineer ( ) | Pending | | | |
| F7 | What a fire alarm system includes | Engineer ( ) | Pending | | | |
| F8 | Smoke vs heat detectors | Engineer ( ) | Pending | | | |
| F9 | Fire alarm testing | Engineer ( ), Owner ( ) | Pending | | | |
| F10 | What commissioning involves | Owner ( ) | Pending | | | |
| F11 | Installing already-purchased equipment | Owner ( ) | Pending | | | |
| F12 | Why an AMC is needed | Engineer ( ) | Pending | | | |
| F13 | Systems one AMC can cover | Owner ( ) | Pending | | | |
| F14 | Fire safety audit scope | Owner ( ) | Pending | | | |
| F15 | When to have a fire safety audit | Engineer ( ) | Pending | | | |
| F16 | Who should attend training | Owner ( ) | Pending | | | |
| F17 | Training topics | Owner ( ) | Pending | | | |
| F18 | Equipment categories supplied | Owner ( ) | Pending | | | |
| F19 | Installation with supply orders | Owner ( ) | Pending | | | |
| F20 | When sites use a fire watch | Engineer ( ) | Pending | | | |
| F21 | Fire crew duties | Owner ( ) | Pending | | | |
| F22 | Shared FAQ disclaimer | Owner ( ), Engineer ( ) | Pending | | | |
| G1 | Guide: Choosing the Right Fire Extinguisher | Engineer ( ) | Pending | | | |
| G2 | Guide: Fire Alarm System Maintenance: The Basics | Engineer ( ) | Pending | | | |
| G3 | Guide: Planning an Annual Maintenance Contract | Engineer ( ) | Pending | | | |
| G4 | Guide: Emergency Preparedness for Workplaces | Engineer ( ) | Pending | | | |
| G5 | Guide: Industrial Fire Safety FAQs | Engineer ( ) | Pending | | | |
| G6 | Guide: A Fire Safety Checklist for Facility Managers | Engineer ( ) | Pending | | | |
| L1 | Privacy policy and terms | Legal ( ) | Pending | | | |
| O1 | Mission and vision (owner decision 1) | Owner ( ) | Pending | | | |
| O2 | Service scope bullets (owner decision 2) | Owner ( ) | Pending | | | |
| O3 | Fire Crew description (owner decision 3) | Owner ( ) | Pending | | | |
| O4 | Service area decision (owner decision 5 / item 9) | Owner ( ) | Pending | | | |
| O5 | Banner photograph rights (owner decision 8) | Owner ( ) | Pending | | | |
| O6 | Data retention period (owner decision 14) | Owner ( ) | Pending | | | |
| O7 | Enquiry inbox (owner decision 15) | Owner ( ) | Pending | | | |
| O8 | Remaining owner decisions 4, 6, 7 and 9–12 (not launch blockers per that file) | Owner ( ) | Pending | | | |
| M1 | Marketing claims in section 4.4 | Owner ( ) | Pending | | | |
| D1 | Production domain confirmed | Owner ( ) | Pending | | | |
| D2 | `NEXT_PUBLIC_SITE_URL` set to the confirmed `https://` domain | Developer ( ) | Pending | | | |
| D3 | Resend sending domain verified; `EMAIL_FROM` on it; real `RESEND_API_KEY` | Developer ( ) | Pending | | | |
| D4 | Production Turnstile keys created and set | Developer ( ) | Pending | | | |
| D5 | Other required production variables set; migrations applied; `ALLOW_TURNSTILE_TEST_KEYS` absent | Developer ( ) | Pending | | | |
| D6 | Decision on the three FAILED local enquiry notifications | Owner ( ) | Pending | | | |

Rows R1–L1 are the 38 checklist items in `CONTENT_REVIEW.md`. The O, M and D rows are package-level decisions drawn from `OWNER_APPROVAL_CHECKLIST.md`, `LAUNCH_READINESS.md` and section 4.4.

---

## 8. Missing information that prevents a complete approval package

1. **Reviewer identities.** No engineer, owner representative, legal adviser or developer has been named, so the register shows roles only.
2. **Andhra Pradesh regulatory sources.** No official AP building-rules or AP Fire Services document has been obtained. Without one, R1-Q2 (which edition applies) cannot be answered from evidence in this package.
3. **The SP 7:2026 text.** The BIS standard record could not be read, and the Goa DFES copy could not be extracted. The part covering fire and life safety is therefore unverified (R1-Q3).
4. **BIS records for the five Indian Standards** (R2) and the **IS 2190 / IS 2189 texts** (R3) have not been collected.
5. **An official ERSS (112) source** and the AP Fire Services NOC procedure (G4, G5) have not been collected.
6. **Production deployment facts:** the domain, hosting provider, database provider and Resend domain verification are all undecided, so the developer section cannot be completed.
7. **Evidence for owner claims:** the company documents behind the site (the official banner, `public/images/safe-bharat-fire-safety-banner.png`, and the *Frontend Website Requirements v1.0*) are referenced, but the requirements document is not in the repository. Evidence for scope, Fire Crew duties and service area must come from the owner.
8. **Inconsistencies between existing documents** (left unchanged; to be resolved by the owner and developer):
   - **Service area:** `OWNER_APPROVAL_CHECKLIST.md` decision 5 marks it "not a launch blocker", but `LAUNCH_READINESS.md` §7 item 3 includes the service-area decision in a blocking item.
   - **AI provider:** `OWNER_APPROVAL_CHECKLIST.md` section C lists an "Anthropic API key" for the assistant, but the configured provider is now Gemini (`LLM_PROVIDER=gemini`). Either is supported.

---

## 9. Final launch authorization checklist

Launch may be authorised only when every box is ticked and each tick points to a completed register row.

**Engineer**
- [ ] R1 decided, and R1-Q1 to R1-Q4 answered with sources
- [ ] R2, R3 and R4 decided
- [ ] Engineer-assigned FAQ rows decided: F2, F3, F4, F5, F6, F7, F8, F9, F12, F15, F20, F22
- [ ] G1–G6 decided. Guides not approved stay `noindex` with the review notice; this does not block launch.

**Owner**
- [ ] C1–C5 decided
- [ ] Owner-assigned FAQ rows decided: F1, F3, F5, F9, F10, F11, F13, F14, F16, F17, F18, F19, F21, F22
- [ ] O1–O8 and M1 decided, including the service area (O4) and banner rights (O5)
- [ ] D1 production domain confirmed; D6 decided

**Legal**
- [ ] L1 decided, and L1-Q1 to L1-Q6 answered

**Content updates**
- [ ] Every Needs Revision outcome applied to the site content and re-checked by the same reviewer
- [ ] `CONTENT_REVIEW.md` statuses updated to match the register

**Developer**
- [ ] D2–D5 complete
- [ ] Validation re-run on the final content (lint, typecheck, unit, integration on the test database, build, E2E), with results recorded
- [ ] The live-site checks in `LAUNCH_READINESS.md` §8 completed after deployment

**Authorization**
- [ ] Launch authorised by the Owner (name, date)

Passing technical checks is required for launch, but it is not sufficient: it does not substitute for any engineer, owner or legal decision above.
