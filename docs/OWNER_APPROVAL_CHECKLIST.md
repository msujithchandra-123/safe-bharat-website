# Owner approval checklist: Safe Bharat website

Tick each item, or send corrections. Items marked **Launch blocker** must be resolved before the site goes live. The others can follow after launch.

## A. Already verified against your company material (no action unless something is wrong)

- [x] Phones +91 85220 21566 and +91 73861 92174, email safebharatsales@gmail.com, PM Palem address, PIN 530041, GSTIN 37CXQPC2666B1ZH, tagline. Checked character by character against the official banner.
- [x] The eight service lines on the banner, all represented: Fire Extinguishers, Fire Protection System, Fire Alarm Systems, Fire & Safety Training, Safety Audit & Consultancy, Installation/Servicing & Maintenance, Equipment Supply, Fire Crew. The website splits "Installation, Servicing & Maintenance" into two pages, "Installation & Commissioning" and "AMC & Maintenance".

## B. Decisions only you can make

| # | Decision | Where | Verifiable from your material? | Launch blocker? | If left unresolved |
| --- | --- | --- | --- | --- | --- |
| 1 | Approve or rewrite the **mission and vision** (currently drafts) | About page · `src/content/company.ts` | No | **Yes** | Draft wording would be published as your official statement |
| 2 | Confirm the **scope bullets** for each service, and remove anything you don't do (e.g. addressable systems, sprinkler installation, refilling) | Service pages · `src/content/services.ts` | Partly (the banner lists service lines, not detailed scope) | **Yes** | Customers may request work you don't offer |
| 3 | Describe what **Fire Crew** covers | `/services/fire-crew` | No | **Yes** | The generic description may not match your offer |
| 4 | Confirm the **six industries** you target | Industries pages | No | No | Pages for sectors you don't target |
| 5 | Confirm your **service area** (Visakhapatnam only, all of Andhra Pradesh, other states?) | FAQ, chatbot knowledge | No | No | The site says "coverage confirmed per enquiry" |
| 6 | Give the **WhatsApp number**, if any | `NEXT_PUBLIC_WHATSAPP_NUMBER` | No | No | WhatsApp buttons stay hidden; phone and email still work |
| 7 | Confirm you are happy to show the **GSTIN** publicly | Footer, About, Contact | It is on the banner | No | Shown, as on the banner |
| 8 | Confirm the **banner's photographs** are licensed for web use | Homepage hero, About | No (rights to the imagery inside the banner are unknown) | **Yes** | Possible copyright exposure for the homepage hero |
| 9 | Approve the **stock photo selection** (28 Unsplash photos, licence verified) | `docs/ASSET_SOURCES.md` | Licences verified; taste and fit need your approval | No | The photos may not reflect your brand as you'd like |
| 10 | Supply **product photos** (your own, or manufacturer images with written permission) | Equipment catalogue, Fire Pumps tile | No | No | Designed icon placeholders remain |
| 11 | Supply **completed projects** (with customer approval), **testimonials** (with permission), **certifications/licences** (with evidence), team photos | Projects, homepage | No | No | Those sections stay empty or hidden. Nothing is invented. |
| 12 | Have a **qualified fire safety professional** review the six guides | `/resources/*` · `src/content/resources.ts` | No | No (they are already noindex with a review notice) | Guides stay out of search engines and keep the review notice |
| 13 | Have a **lawyer** review the Privacy Policy and Terms (e.g. against India's DPDP Act, 2023) | `/privacy-policy`, `/terms` · `src/content/legal.ts` | No | **Yes** | Legal exposure; the pages have not been legally reviewed |
| 14 | Confirm the **data retention period** (currently 24 months) | `ENQUIRY_RETENTION_DAYS`, privacy policy | No | No | Enquiries older than 24 months are deleted automatically |
| 15 | Confirm the **inbox** that receives enquiries | `ENQUIRY_NOTIFICATION_TO` (now safebharatsales@gmail.com) | Address is on the banner | **Yes** | Leads go to this inbox |

## C. Accounts and credentials you need to create (see `docs/DEPLOYMENT.md`)

- **Domain name.** Required for HTTPS, email sending and Turnstile.
- **Hosting.** Vercel recommended.
- **Managed PostgreSQL**, with daily backups.
- **Resend account**, with your domain verified (DNS records), plus an API key.
- **Cloudflare Turnstile** site key and secret for your domain.
- **Anthropic API key** for the AI assistant. Optional: without it, the assistant shows an offline state.
- **Private S3 or R2 bucket** for attachments. Optional: without it, the attachment field is hidden.
