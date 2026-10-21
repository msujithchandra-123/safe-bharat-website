# Visual asset sources and licences

Every image used on the site is stored locally under `public/` and listed here. No image is loaded from a third-party host. The code registry for photographs is `src/content/images.ts`. A unit test (`tests/unit/assets.test.tsx`) checks that every registry entry exists on disk, has the declared dimensions, and appears in this manifest.

## 1. Company assets (Safe Bharat)

| Local path | Derived from | Licence / permission | Usage | Status |
| --- | --- | --- | --- | --- |
| `public/brand/safe-bharat-logo-full.png`, `safe-bharat-lockup.png`, `safe-bharat-emblem.png`, `safe-bharat-wordmark.png`; `src/app/icon.png`, `apple-icon.png`, `opengraph-image.png` | Official logo file supplied by the owner (`logo for safe bharat.png`). Crops and resizes only, made by `scripts/prepare-brand-assets.mjs`. | Company-owned | Header, favicon, social card, chat panel, preloader (the footer uses a text wordmark; `safe-bharat-lockup.png` is currently not displayed) | Verified source. The owner should confirm the crop-based horizontal header lockup is acceptable. |
| `public/images/safe-bharat-banner.webp`, `public/images/hero-industrial-equipment.webp` | Official banner supplied by the owner (`Safe Bharat Banner.jpg`). The hero image is a crop of its photographic panel. | Company-owned banner. **The rights to the photographic content inside the banner have not been confirmed.** | Homepage hero (crop). The full banner is **no longer displayed**: the About page now uses a stock photo (section 3). The file is kept, not deleted. | Needs owner confirmation that the banner's imagery is licensed for web use. |

| `public/images/safe-bharat-fire-safety-banner.png` | Image uploaded by the owner on 2026-10-15 (`image(20261015-095204).png`, 1536×1024). Copied **byte for byte** (SHA-256 `cc418feb…2e167a0`); not cropped, resized or re-encoded. Next.js serves resized copies at request time. | Company-supplied. **The rights to its photographic and illustrated content have not been confirmed.** | About page, shown in full (no cropping). No longer on the home page, because it has text built into the image (section 3b). | Needs owner confirmation of usage rights, as for the earlier banner. |

The original source files remain on the owner's Desktop and were not modified. Only web copies were created.

**No longer displayed (kept, not deleted):** `public/images/hero-industrial-equipment.webp` (previous home hero crop) and `public/images/about/industrial-sprinkler-riser-pipework.webp` (previous About photo). The new owner banner replaced both.

## 2. Stock photography (Unsplash)

**Licence verified on 2026-10-15** at <https://unsplash.com/license>:

- Free for commercial and non-commercial use, without permission or attribution.
- Not allowed: selling unmodified copies, or compiling images to build a competing service.

**Verification method for each photo:**

1. The search listing showed it as free, not "Unsplash+".
2. An anonymous download through `https://unsplash.com/photos/<id>/download` succeeded. As a control, a known Unsplash+ photo returns **HTTP 403** through the same route.
3. Individual photo pages were spot-checked (K4dBR3TiH4U and U-4b9CMcr7k). Both state "Free to use under the Unsplash License".

**Editorial safeguards:**

- Stock photos illustrate types of work and equipment. They are never captioned as Safe Bharat staff, customers or projects.
- No visible third-party product branding was selected. A candidate showing Siemens-branded detectors was rejected.
- Attribution is not required, but the creators are credited here.

| Local path | Original source | Creator | Licence | Intended usage | Size |
| --- | --- | --- | --- | --- | --- |
| `public/images/general/oil-refinery-columns-daylight.webp` | [unsplash.com/photos/76yzygeNLT0](https://unsplash.com/photos/76yzygeNLT0) | Christian Harb | Unsplash License | Industries overview page hero | 1920×1200, 187 KB |
| `public/images/general/industrial-plant-at-night.webp` | [unsplash.com/photos/H72SCCTZPE8](https://unsplash.com/photos/H72SCCTZPE8) | PilMo Kang | Unsplash License | Services overview page hero | 1920×1281, 389 KB |
| `public/images/services/fire-extinguisher-wall-mounted-with-sign.webp` | [unsplash.com/photos/GCmVg5lztwI](https://unsplash.com/photos/GCmVg5lztwI) | Jakub Żerdzicki | Unsplash License | Fire Extinguishers: service card and page hero | 1920×1281, 165 KB |
| `public/images/services/sprinkler-fire-department-connection.webp` | [unsplash.com/photos/U-4b9CMcr7k](https://unsplash.com/photos/U-4b9CMcr7k) | Kevin Butz | Unsplash License | Fire Protection Systems: service card and page hero | 1920×1278, 107 KB |
| `public/images/services/fire-alarm-horn-strobe.webp` | [unsplash.com/photos/OLSy8_770lw](https://unsplash.com/photos/OLSy8_770lw) | Jalen Hueser | Unsplash License | Fire Alarm Systems: service card and page hero | 1920×2452, 125 KB |
| `public/images/services/technician-testing-control-panel-wiring.webp` | [unsplash.com/photos/PkHf7BUWbtk](https://unsplash.com/photos/PkHf7BUWbtk) | Toolmash Expo | Unsplash License | Installation & Commissioning: service card and page hero | 1920×1440, 112 KB |
| `public/images/services/fire-extinguisher-with-inspection-tag.webp` | [unsplash.com/photos/-loCA-0LGQc](https://unsplash.com/photos/-loCA-0LGQc) | Erik Mclean | Unsplash License | AMC & Maintenance: service card and page hero | 1920×1280, 161 KB |
| `public/images/services/safety-inspector-checking-wall-panel.webp` | [unsplash.com/photos/K4dBR3TiH4U](https://unsplash.com/photos/K4dBR3TiH4U) | Citadel Life Safety (company account) | Unsplash License | Fire Safety Audit & Consultancy: service card and page hero | 1920×1047, 33 KB |
| `public/images/services/fire-extinguisher-training-demonstration.webp` | [unsplash.com/photos/bPUvUVxPzGE](https://unsplash.com/photos/bPUvUVxPzGE) | Chandler Cruttenden | Unsplash License | Fire & Safety Training: service card and page hero | 1920×2880, 240 KB |
| `public/images/services/row-of-wall-mounted-fire-extinguishers.webp` | [unsplash.com/photos/wNDZ0uSCB5A](https://unsplash.com/photos/wNDZ0uSCB5A) | Jandira Sonnendeck | Unsplash License | Equipment Supply: service card and page hero | 1920×1285, 241 KB |
| `public/images/services/firefighter-turnout-gear.webp` | [unsplash.com/photos/q40XEHz-MLs](https://unsplash.com/photos/q40XEHz-MLs) | Matt C | Unsplash License | Fire Crew: service card and page hero | 1920×1280, 236 KB |
| `public/images/industries/manufacturing-production-floor.webp` | [unsplash.com/photos/pWUyHVJgLhg](https://unsplash.com/photos/pWUyHVJgLhg) | Homa Appliances (company account) | Unsplash License | Manufacturing: industry card and page hero | 1920×1281, 245 KB |
| `public/images/industries/chemical-plant-drum-storage.webp` | [unsplash.com/photos/xc7sWUtKVU4](https://unsplash.com/photos/xc7sWUtKVU4) | ayumi kubo | Unsplash License | Chemical & Fertilizer Plants: industry card and page hero | 1920×1280, 417 KB |
| `public/images/industries/pharmaceutical-laboratory-glassware.webp` | [unsplash.com/photos/v41sgDGz4ik](https://unsplash.com/photos/v41sgDGz4ik) | Chidera Faustina Okeke | Unsplash License | Pharmaceutical Facilities: industry card and page hero | 1920×2880, 153 KB |
| `public/images/industries/modern-commercial-office-building.webp` | [unsplash.com/photos/1deQbU6DhBg](https://unsplash.com/photos/1deQbU6DhBg) | kaleb tapp | Unsplash License | Commercial Buildings: industry card and page hero | 1920×1490, 218 KB |
| `public/images/industries/warehouse-racking-aisle.webp` | [unsplash.com/photos/h3pVxOIpnzk](https://unsplash.com/photos/h3pVxOIpnzk) | Lance Chang | Unsplash License | Warehouses & Logistics: industry card and page hero | 1920×1280, 154 KB |
| `public/images/industries/container-port-at-dusk.webp` | [unsplash.com/photos/yx20mpDyr2I](https://unsplash.com/photos/yx20mpDyr2I) | Timelab | Unsplash License | Infrastructure & Industrial: industry card and page hero | 1920×1021, 231 KB |
| `public/images/equipment/fire-extinguisher-on-red-panel.webp` | [unsplash.com/photos/7RfP8lLkHwI](https://unsplash.com/photos/7RfP8lLkHwI) | Andrei Slobtsov | Unsplash License | Homepage equipment tile: Fire Extinguishers | 1200×1598, 68 KB |
| `public/images/equipment/fire-alarm-bell.webp` | [unsplash.com/photos/tjebwsmrfmY](https://unsplash.com/photos/tjebwsmrfmY) | Eric Prouzet | Unsplash License | Homepage equipment tile: Fire Alarm Equipment | 1200×800, 269 KB |
| `public/images/equipment/fire-hose-reel-cabinet.webp` | [unsplash.com/photos/jv1BTz-X4wg](https://unsplash.com/photos/jv1BTz-X4wg) | Syed Hussaini | Unsplash License | Homepage equipment tile: Hydrant & Hose Equipment | 1200×900, 31 KB |
| `public/images/equipment/red-sprinkler-pipework-ceiling.webp` | [unsplash.com/photos/KsLbHArxEuU](https://unsplash.com/photos/KsLbHArxEuU) | Valentin Lacoste | Unsplash License | Homepage equipment tile: Sprinkler Equipment | 1200×900, 63 KB |
| `public/images/equipment/hard-hats-and-safety-vests.webp` | [unsplash.com/photos/wjHdeYmI-XU](https://unsplash.com/photos/wjHdeYmI-XU) | Tanya Paquet | Unsplash License | Homepage equipment tile: Signage & PPE | 1200×1800, 116 KB |
| `public/images/resources/fire-extinguisher-on-dark-wall.webp` | [unsplash.com/photos/PWOV__8cRpw](https://unsplash.com/photos/PWOV__8cRpw) | Tak Kei Wong | Unsplash License | Guide: Choosing the Right Fire Extinguisher | 1200×800, 19 KB |
| `public/images/resources/manual-call-point-and-sign.webp` | [unsplash.com/photos/kPoSgf_cjTk](https://unsplash.com/photos/kPoSgf_cjTk) | Jakub Żerdzicki | Unsplash License | Guide: Fire Alarm System Maintenance | 1200×1754, 342 KB |
| `public/images/resources/fire-extinguishers-awaiting-service.webp` | [unsplash.com/photos/P3UNzx5EFYA](https://unsplash.com/photos/P3UNzx5EFYA) | yahdi yasya | Unsplash License | Guide: Planning an AMC | 1200×900, 62 KB |
| `public/images/resources/illuminated-emergency-exit-sign.webp` | [unsplash.com/photos/SKrgZQgYy2g](https://unsplash.com/photos/SKrgZQgYy2g) | Andrew Teoh | Unsplash License | Guide: Emergency Preparedness for Workplaces | 1200×901, 90 KB |
| `public/images/resources/process-plant-at-night.webp` | [unsplash.com/photos/n7lhAQWAfTU](https://unsplash.com/photos/n7lhAQWAfTU) | mos design | Unsplash License | Guide: Industrial Fire Safety FAQs | 1200×800, 88 KB |
| `public/images/resources/workers-reviewing-safety-checklist.webp` | [unsplash.com/photos/IvEYfb-3B70](https://unsplash.com/photos/IvEYfb-3B70) | RONNAKORN TRIRAGANON | Unsplash License | Guide: Fire Safety Checklist for Facility Managers | 1200×800, 93 KB |

All 28 photos: status **Verified — Unsplash License**. They were downloaded at up to 2000 px and stored as WebP (1920 px for page heroes, 1200 px for tiles and guides). Next.js generates the responsive sizes.

## 3. Pexels and Unsplash photos added on 2026-10-15 (equipment products and About page)

**Pexels licence verified on 2026-10-15** at <https://www.pexels.com/license/>:

- Free to use; attribution not required; modification allowed.
- Not allowed: selling unaltered copies, implying endorsement by people or brands shown, redistributing on stock platforms, or using the photos as a trademark.

Each Pexels photo page below was opened and shows "Free" under the licence heading. Downloads were taken from the official Pexels image CDN (`images.pexels.com`) and stored locally.

**Selection rule:** a product photo is used only where it clearly shows that exact type of equipment, with no legible third-party brand. Otherwise the neutral placeholder remains.

| Local path | Original source | Creator | Licence | Intended usage | Notes |
| --- | --- | --- | --- | --- | --- |
| `public/images/equipment/items/abc-dry-powder-extinguisher-label.webp` | [pexels.com/photo/18329661](https://www.pexels.com/photo/fire-extinguishers-standing-on-the-grass-18329661/) | Jeffry Surianto | Pexels License | ABC Dry Powder Extinguisher card and page | Cropped to the unit labelled "ABC POWDER"; the FIREDEKA-branded unit in the original is excluded |
| `public/images/equipment/items/manual-pull-station-call-point.webp` | [pexels.com/photo/37893435](https://www.pexels.com/photo/wall-mounted-red-fire-alarm-system-37893435/) | panumas nikhomkhai | Pexels License | Manual Call Points | Pull-station style (common internationally; break-glass call points are also used in India) |
| `public/images/equipment/items/ceiling-horn-strobe-sounder.webp` | [pexels.com/photo/39183052](https://www.pexels.com/photo/ceiling-mounted-fire-alarm-system-in-building-39183052/) | Caleb Oquendo | Pexels License | Hooters, Sounders & Strobes | |
| `public/images/equipment/items/hydrant-valve-and-rolled-hose-cabinet.webp` | [pexels.com/photo/9008241](https://www.pexels.com/photo/photograph-of-a-rolled-fire-hose-9008241/) | Jan van der Wolf | Pexels License | Hydrant Landing Valves | |
| `public/images/equipment/items/rolled-fire-delivery-hoses.webp` | [unsplash.com/photos/RR9oBch57To](https://unsplash.com/photos/RR9oBch57To) | Dottie Di Liddo | Unsplash License | Fire Hoses & Branch Pipes | |
| `public/images/equipment/items/wall-mounted-hose-reel.webp` | [pexels.com/photo/189466](https://www.pexels.com/photo/red-hose-storage-handle-189466/) | Oluwaseun Duncan | Pexels License | First-Aid Hose Reels | Small manufacturer roundel on the hub is not legible at web sizes |
| `public/images/equipment/items/illuminated-fire-exit-sign.webp` | [pexels.com/photo/19443144](https://www.pexels.com/photo/emergency-sing-under-the-ceiling-19443144/) | Umar Andrabi | Pexels License | Fire & Safety Signage | |
| `public/images/equipment/items/safety-helmets-and-hi-vis-vests.webp` | [pexels.com/photo/34442873](https://www.pexels.com/photo/orange-safety-vests-and-blue-helmets-hanging-34442873/) | Carsten Ruthemann | Pexels License | Personal Protective Equipment | |
| `public/images/about/industrial-sprinkler-riser-pipework.webp` | [pexels.com/photo/37352142](https://www.pexels.com/photo/industrial-fire-sprinkler-system-pipes-37352142/) | Loc Ho | Pexels License | About page (replaces the promotional banner) | Captioned as illustrative; not presented as a Safe Bharat project |

## 3a. Wikimedia Commons photos added on 2026-10-15 (remaining equipment products)

Source files were found through the official Wikimedia Commons API. Licence, author and source were read from each file's metadata, which comes from the licence template on its file page. GFDL-only files were excluded, because that licence requires reproducing its full text.

**Attribution:** CC BY / CC BY-SA require it, so each of these photos is credited:
- on its product page, with author, source link, licence link and changes;
- on the public page `/image-credits`, linked in the footer.

Credit data lives in `src/content/images.ts` (`credit` field).

**ShareAlike:** these files were only resized and converted to WebP. As adaptations of CC BY-SA originals, they are shared under the same licence, which the credits page states.

| Local path | Original source | Creator | Licence | Intended usage | Notes |
| --- | --- | --- | --- | --- | --- |
| `public/images/equipment/items/co2-extinguisher-with-discharge-horn.webp` | [File:CO_extinguisher_2.PNG](https://commons.wikimedia.org/wiki/File:CO_extinguisher_2.PNG) | Rt66lt (English Wikipedia) | CC BY-SA 3.0 (relicensed from GFDL under the 2009 licence migration) | CO₂ Fire Extinguisher | Low resolution (800×600) and worn unit. No legible manufacturer. A better owner or manufacturer photo is preferable. |
| `public/images/equipment/items/stored-pressure-water-extinguisher.webp` | [File:Pressurized_water_fire_extinguisher.jpg](https://commons.wikimedia.org/wiki/File:Pressurized_water_fire_extinguisher.jpg) | Bigfootfireman | Public domain | Water-Type Fire Extinguisher | Stainless stored-pressure (US style). Indian water-type units are usually red. |
| `public/images/equipment/items/foam-extinguisher-9-litre.webp` | [File:Skumsläckare_9_liter.jpg](https://commons.wikimedia.org/wiki/File:Skumsl%C3%A4ckare_9_liter.jpg) | Joffboff | CC BY-SA 4.0 | Mechanical Foam Fire Extinguisher | Swedish/English label. Only the SIS standards mark is visible, no manufacturer brand. |
| `public/images/equipment/items/fire-alarm-control-panel-keypad.webp` | [File:Fire_alarm_panel_reset.jpg](https://commons.wikimedia.org/wiki/File:Fire_alarm_panel_reset.jpg) | Ben Schumin | CC BY-SA 3.0 | Fire Alarm Control Panel | The file description identifies the panel as a Siemens MXL, but no logo is visible in the image. Low resolution (480×640). |
| `public/images/equipment/items/ceiling-smoke-detector.webp` | [File:20150209감지기13.jpg](https://commons.wikimedia.org/wiki/File:20150209%EA%B0%90%EC%A7%80%EA%B8%B013.jpg) | 최광모 (Choi Kwang-mo) | CC BY-SA 4.0 | Smoke Detectors | Moulded text on the detector is not legible at web sizes. |
| `public/images/equipment/items/rate-of-rise-heat-detector.webp` | [File:Rate-of-rise_sopt_type_detector.JPG](https://commons.wikimedia.org/wiki/File:Rate-of-rise_sopt_type_detector.JPG) | 100yen | CC BY-SA 3.0 | Heat Detectors | The file title identifies it as a rate-of-rise spot-type heat detector. |
| `public/images/equipment/items/pendent-glass-bulb-sprinkler-head.webp` | [File:MV_Logos_II_IMG_7018.jpg](https://commons.wikimedia.org/wiki/File:MV_Logos_II_IMG_7018.jpg) | Dirk.heldmaier | CC BY-SA 3.0 | Sprinkler Heads | |

**Candidates rejected:**

| Candidate | Reason |
| --- | --- |
| Many control panel photos | Show Esser, Bosch, Siemens, Honeywell, Grinnell, Asenware, Eaton or Sauter branding |
| Smoke detector studio shot (`Detection_device_fsp-851.jpg`) | A specific branded model, at very low resolution |
| Foam extinguisher (`247_Home_Rescue_fire_extinguisher.jpg`) | Uploaded by a retailer, with a company logo on the label |
| Foam extinguishers showing Housegard, Viking, Kidde or Appron branding | Visible brand names |
| CO₂ extinguisher with VKS branding | Visible brand name |
| `Pelapone diesel fire pump set` (Hereford Waterworks Museum) | Vintage museum exhibit; would misrepresent a modern fire pump set |

**Fire pumps (added 2026-10-16):** a broader Wikimedia Commons search found real photographs of modern fixed fire-pump installations. Both photos below come from the same author and are credited on the product page and at `/image-credits`.

| Local path | Original source | Creator | Licence | Intended usage | Notes |
| --- | --- | --- | --- | --- | --- |
| `public/images/equipment/items/electric-fire-sprinkler-pump-set.webp` | [File:Fire_Sprinkle_Pump_electric,_Brisbane,_2021.jpg](https://commons.wikimedia.org/wiki/File:Fire_Sprinkle_Pump_electric,_Brisbane,_2021.jpg) | Kgbo | CC BY-SA 4.0 | Fire Pump Sets product card and page | Electric sprinkler pump set: pump, motor and controller on one base, labelled "SPRINKLER PUMP". No legible manufacturer branding. Resized to 1200×900 WebP. |
| `public/images/equipment/diesel-fire-pump-plant-room.webp` | [File:Fire_pumps_plantroom,_Sydney,_2022.jpg](https://commons.wikimedia.org/wiki/File:Fire_pumps_plantroom,_Sydney,_2022.jpg) | Kgbo | CC BY-SA 4.0 | Homepage equipment tile "Fire Pumps" | Diesel fire pump plant room. Resized to 1200×900 WebP. |

**Fire pump candidates rejected in this search:**
- A pump-room photo showing a sticker with a phone number (`Fire pump, Kabalulumana Hostel, Mount Isa, 2023.jpg`).
- A 3D marketing render (`Single ElectricDiesel Fire Protection Pump.jpg`).
- Portable and vehicle pumps, and museum or vintage pumps.

No equipment product or category uses the placeholder any more. The fallback stays in the code for images that fail to load.

## 3b. Homepage hero

| Local path | Source | Rights | Usage | Notes |
| --- | --- | --- | --- | --- |
| `public/images/hero/safe-bharat-industrial-hero.png` | **AI-generated** with OpenAI ChatGPT image generation, specifically for this website, and supplied by the owner in the development session on 2026-10-16. Copied **byte for byte** (SHA-256 `5bdfc14c…16c6ee7`); not cropped, resized or re-encoded. 1672×941 PNG (16:9), 3.1 MB. Next.js serves optimised AVIF/WebP copies at request time. | Approved by the owner on 2026-10-16 as the final hero image. Not a stock photo; no stock-photo licence or attribution requirement has been identified, and none is claimed. **Commercial-use permission has not been independently verified** (see "Generation and terms" below). | Home page hero at every width, in a 3:2 frame (object-fit cover, centred, so roughly 8% is trimmed from each side) | Illustrative: an AI-generated, imagined industrial setting, **not a verified photograph** of a real site or a Safe Bharat installation, and not to be captioned as one. No legible text, logos or watermarks at full resolution. A few faint, unreadable label-like marks on the fire engine and a hose reel cabinet are a few pixels high and not visible at display size. |

**Generation and terms:**
- **Tool:** OpenAI ChatGPT image generation, as stated by the owner. The account used and the exact generation date and time are not recorded here.
- **Full SHA-256:** `5bdfc14cce36a97e9c9f87d540d585fb81d9728a65bc623acd63f088516c6ee7`.
- **Commercial use:** whether the image may be used commercially, and on what conditions, depends on the OpenAI terms that applied to the account used, on the date the image was generated. Those terms have **not** been reviewed or verified for this project, and no legal clearance is claimed. **Before launch, the owner should check the applicable OpenAI terms (and any usage policies they reference) for that account and date, and keep a copy or record of them with this file.**
- **Attribution:** none is shown on the site. This record does not establish that attribution is or is not required; that follows from the applicable terms above.

**History:**
1. The owner's promotional banner was removed from the hero because it has text built into the image. It is still used on the About page.
2. A Wikimedia Commons photograph of fire monitor towers ("Fire Equipment.jpg", David Brossard, CC BY-SA 2.0) was tried and rejected by the owner. Its web files were deleted.
3. A navy placeholder panel filled the hero until the image above was supplied. The placeholder has been removed.

## 4. Icons

- Interface and service icons come from **Lucide React** (`lucide-react`, ISC licence), through `src/components/ui/icon.tsx`.
- The small check and plus marks in lists and the FAQ are inline SVG paths written for this project.
- No third-party SVG markup was copied.

## 5. Designed placeholders (no photo)

| Where | Why | What is shown |
| --- | --- | --- |
| Projects | No approved project photography exists | Empty-state panel |
| Any image that fails to load | Resilience | `SiteImage` falls back to a blueprint panel and icon, never a broken-image glyph |

## 6. Still needed from Safe Bharat

1. Confirmation that the photographic content in the official banner may be used on the website.
2. Optionally, Safe Bharat's own product photos, or manufacturer images **with written permission**, to replace the stock and Commons equipment photos with the makes actually supplied.
3. Approved photographs of Safe Bharat's own team, vehicles, workshop and completed projects (with customer consent). These would replace stock photos where authenticity matters, such as Fire Crew and Training.
4. Approval of the overall image selection.
