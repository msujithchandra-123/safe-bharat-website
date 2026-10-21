/**
 * Registry of every photograph used on the site. Each entry is a local file
 * under /public/images, documented in docs/ASSET_SOURCES.md (source URL,
 * creator, licence). Stock photos illustrate the type of work or equipment;
 * they do not show Safe Bharat staff, customers or completed projects.
 *
 * `position` is the CSS object-position used when the image is cropped.
 */
export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  position?: string;
  /** Present when the licence requires attribution (Creative Commons BY / BY-SA). Shown on the page and at /image-credits. */
  credit?: ImageCredit;
}

export interface ImageCredit {
  author: string;
  license: string;
  licenseUrl: string | null;
  sourceUrl: string;
  /** e.g. "resized" — CC licences require indicating changes. */
  changes: string;
}

const commons = (author: string, license: "CC BY-SA 2.0" | "CC BY-SA 3.0" | "CC BY-SA 4.0" | "Public domain", file: string): ImageCredit => ({
  author,
  license,
  licenseUrl:
    license === "Public domain" ? null : `https://creativecommons.org/licenses/by-sa/${license.slice("CC BY-SA ".length)}/`,
  sourceUrl: `https://commons.wikimedia.org/wiki/File:${file}`,
  changes: "resized and converted to WebP",
});

const credited = (image: SiteImage, credit: ImageCredit): SiteImage => ({ ...image, credit });

const img = (src: string, width: number, height: number, alt: string, position = "center"): SiteImage => ({
  src: `/images/${src}.webp`,
  width,
  height,
  alt,
  position,
});

export const generalImages = {
  refinery: img("general/oil-refinery-columns-daylight", 1920, 1200, "Distillation columns and pipework at an oil refinery under a clear sky"),
  plantAtNight: img("general/industrial-plant-at-night", 1920, 1281, "A large industrial plant lit up at night"),
} as const;

export const serviceImages: Record<string, SiteImage> = {
  "fire-extinguishers": img("services/fire-extinguisher-wall-mounted-with-sign", 1920, 1281, "Red fire extinguisher mounted on a concrete wall beneath an extinguisher location sign", "62% center"),
  "fire-protection-systems": img("services/sprinkler-fire-department-connection", 1920, 1278, "Automatic sprinkler fire department connection and gate valve on a yellow wall", "40% center"),
  "fire-alarm-systems": img("services/fire-alarm-horn-strobe", 1920, 2452, "Wall-mounted fire alarm horn and strobe notification device", "center 45%"),
  "installation-commissioning": img("services/technician-testing-control-panel-wiring", 1920, 1440, "Technician in insulated gloves testing control panel wiring with a meter"),
  "amc-maintenance": img("services/fire-extinguisher-with-inspection-tag", 1920, 1280, "Wall-mounted fire extinguisher with its inspection tag attached", "45% center"),
  "fire-safety-audits": img("services/safety-inspector-checking-wall-panel", 1920, 1047, "Inspector in a hard hat checking a wall-mounted panel during a site inspection", "70% center"),
  "fire-safety-training": img("services/fire-extinguisher-training-demonstration", 1920, 2880, "Firefighters in protective gear demonstrating a fire extinguisher on a small controlled outdoor fire", "center 60%"),
  "fire-safety-equipment-supply": img("services/row-of-wall-mounted-fire-extinguishers", 1920, 1285, "Row of five red fire extinguishers mounted on a green wall"),
  "fire-crew": img("services/firefighter-turnout-gear", 1920, 1280, "Firefighter helmets and turnout coats hanging ready for use"),
};

export const industryImages: Record<string, SiteImage> = {
  manufacturing: img("industries/manufacturing-production-floor", 1920, 1281, "Modern manufacturing production floor with machinery lines"),
  "chemical-fertilizer-plants": img("industries/chemical-plant-drum-storage", 1920, 1280, "Chemical process plant with pipework, a forklift and drum storage"),
  pharmaceutical: img("industries/pharmaceutical-laboratory-glassware", 1920, 2880, "Laboratory shelves holding glassware and chemical containers", "center 35%"),
  "commercial-buildings": img("industries/modern-commercial-office-building", 1920, 1490, "Modern commercial office building with a glass and metal facade"),
  "warehouses-logistics": img("industries/warehouse-racking-aisle", 1920, 1280, "Long warehouse aisle lined with high storage racking"),
  "infrastructure-industrial": img("industries/container-port-at-dusk", 1920, 1021, "Container port with ship-to-shore cranes and stacked containers at dusk"),
};

/** Category photographs. `null` means no accurate licensed photo is available yet; a designed placeholder is shown. */
export const equipmentCategoryImages: Record<string, SiteImage | null> = {
  "fire-extinguishers": img("equipment/fire-extinguisher-on-red-panel", 1200, 1598, "Fire extinguisher mounted on a red wall panel", "center 40%"),
  "fire-alarm-equipment": img("equipment/fire-alarm-bell", 1200, 800, "Red automatic fire alarm bell mounted on a brick wall"),
  "hydrant-equipment": img("equipment/fire-hose-reel-cabinet", 1200, 900, "Fire hose reel cabinet with a landing valve beneath a fire hose reels sign"),
  "sprinkler-equipment": img("equipment/red-sprinkler-pipework-ceiling", 1200, 900, "Red fire protection pipework running along an exposed concrete ceiling"),
  "fire-pumps": credited(
    img("equipment/diesel-fire-pump-plant-room", 1200, 900, "Diesel-driven fire pump sets with red pipework, valves and controllers in a fire pump plant room", "60% center"),
    commons("Kgbo", "CC BY-SA 4.0", "Fire_pumps_plantroom,_Sydney,_2022.jpg"),
  ),
  "signage-ppe": img("equipment/hard-hats-and-safety-vests", 1200, 1800, "Safety helmets and high-visibility vests hanging on a wall", "center 25%"),
};

/**
 * Per-product photos. A photo is used only where it clearly shows that exact type of
 * equipment; otherwise `null` keeps the neutral placeholder rather than risk showing
 * the wrong product (see docs/ASSET_SOURCES.md for the rejected candidates).
 */
export const equipmentItemImages: Record<string, SiteImage | null> = {
  "abc-dry-powder-extinguisher": img("equipment/items/abc-dry-powder-extinguisher-label", 900, 1985, "Portable fire extinguisher labelled multi-purpose dry chemical ABC powder", "center 64%"),
  "co2-extinguisher": credited(
    img("equipment/items/co2-extinguisher-with-discharge-horn", 800, 600, "Carbon dioxide fire extinguisher with its discharge horn, standing on a workshop floor", "42% center"),
    commons("Rt66lt (English Wikipedia)", "CC BY-SA 3.0", "CO_extinguisher_2.PNG"),
  ),
  "water-type-extinguisher": credited(
    img("equipment/items/stored-pressure-water-extinguisher", 1200, 1600, "Stainless-steel stored-pressure water fire extinguisher with discharge hose", "center 40%"),
    commons("Bigfootfireman", "Public domain", "Pressurized_water_fire_extinguisher.jpg"),
  ),
  "mechanical-foam-extinguisher": credited(
    img("equipment/items/foam-extinguisher-9-litre", 1200, 2159, "Nine-litre foam fire extinguisher with an instruction label rated for class A and B fires", "center 55%"),
    commons("Joffboff", "CC BY-SA 4.0", "Skumsl%C3%A4ckare_9_liter.jpg"),
  ),
  "fire-alarm-control-panel": credited(
    img("equipment/items/fire-alarm-control-panel-keypad", 480, 640, "Hand operating a fire alarm control panel with alarm, silence, supervisory and power indicators", "center 55%"),
    commons("Ben Schumin", "CC BY-SA 3.0", "Fire_alarm_panel_reset.jpg"),
  ),
  "smoke-detectors": credited(
    img("equipment/items/ceiling-smoke-detector", 1200, 800, "Ceiling-mounted point smoke detector"),
    commons("최광모 (Choi Kwang-mo)", "CC BY-SA 4.0", "20150209%EA%B0%90%EC%A7%80%EA%B8%B013.jpg"),
  ),
  "heat-detectors": credited(
    img("equipment/items/rate-of-rise-heat-detector", 1200, 800, "Rate-of-rise spot-type heat detector mounted on a ceiling"),
    commons("100yen", "CC BY-SA 3.0", "Rate-of-rise_sopt_type_detector.JPG"),
  ),
  "manual-call-points": img("equipment/items/manual-pull-station-call-point", 1200, 801, "Red wall-mounted fire alarm pull station marked Fire, push in, pull down"),
  "hooters-and-sounders": img("equipment/items/ceiling-horn-strobe-sounder", 1200, 801, "Ceiling-mounted fire alarm horn and strobe marked Fire"),
  "hydrant-landing-valves": img("equipment/items/hydrant-valve-and-rolled-hose-cabinet", 1200, 800, "Hydrant valve and coupling beside a rolled fire hose in a red cabinet"),
  "fire-hoses-and-branch-pipes": img("equipment/items/rolled-fire-delivery-hoses", 1200, 800, "Rolled red fire delivery hoses with metal couplings"),
  "first-aid-hose-reels": img("equipment/items/wall-mounted-hose-reel", 1200, 800, "Red first-aid fire hose reel mounted on a wall", "30% center"),
  "sprinkler-heads": credited(
    img("equipment/items/pendent-glass-bulb-sprinkler-head", 1024, 768, "Pendent automatic sprinkler head with a glass bulb fitted to a red fire protection pipe", "35% center"),
    commons("Dirk.heldmaier", "CC BY-SA 3.0", "MV_Logos_II_IMG_7018.jpg"),
  ),
  "fire-pump-sets": credited(
    img("equipment/items/electric-fire-sprinkler-pump-set", 1200, 900, "Electric fire sprinkler pump set with pump, motor, controller and pressure gauges mounted on a common base frame"),
    commons("Kgbo", "CC BY-SA 4.0", "Fire_Sprinkle_Pump_electric,_Brisbane,_2021.jpg"),
  ),
  "safety-signage": img("equipment/items/illuminated-fire-exit-sign", 1200, 1594, "Illuminated fire exit sign with a running figure and arrows hanging from an industrial ceiling", "center 40%"),
  "personal-protective-equipment": img("equipment/items/safety-helmets-and-hi-vis-vests", 1200, 800, "Rows of safety helmets and high-visibility vests on racks"),
};

export interface HomeHeroImages {
  /** 3:2 landscape, about 1200×800. Used from 640px up, or everywhere when `mobile` is null. */
  desktop: SiteImage;
  /** Optional 3:4 portrait, about 900×1200, for phones. */
  mobile: SiteImage | null;
}

/**
 * Homepage hero. An image generated specifically for this website and approved
 * by the owner on 2026-10-16, stored exactly as supplied (16:9 PNG; Next.js
 * serves optimised AVIF/WebP copies). It is illustrative, not a photograph of a
 * real site or a Safe Bharat installation, so it carries no stock licence or
 * credit. The hero frame is 3:2, so `position` decides the side crop.
 */
export const homeHeroImages: HomeHeroImages = {
  desktop: {
    src: "/images/hero/safe-bharat-industrial-hero.png",
    width: 1672,
    height: 941,
    alt: "Red fire-water pipework with a large gate valve, hydrant risers and a fire pump control cabinet at an industrial refinery at dusk, with a fire engine, hose reel cabinets and lit distillation columns behind",
    position: "center",
  },
  mobile: null,
};

/**
 * Company-supplied banner (owner's upload, used unmodified). Shown in full on the
 * About page: it already carries the tagline, so it is never cropped.
 */
export const companyBannerImage: SiteImage = {
  src: "/images/safe-bharat-fire-safety-banner.png",
  width: 1536,
  height: 1024,
  alt: "Fire extinguishers marked powder and water, a fire alarm control panel, a smoke detector, a sprinkler head, a hose reel, a sounder and a manual call point in front of an industrial plant at sunset, beside two firefighters wearing breathing apparatus, with the tagline Committed to Safety. Dedicated to Protection.",
};

/** No longer displayed (the About page now uses companyBannerImage); the file is kept. */
export const aboutImage = img("about/industrial-sprinkler-riser-pipework", 1920, 1440, "Red fire sprinkler riser pipes and valves along the exterior wall of an industrial building");

export const resourceImages: Record<string, SiteImage> = {
  "choosing-the-right-fire-extinguisher": img("resources/fire-extinguisher-on-dark-wall", 1200, 800, "Fire extinguisher mounted on a dark wall below a location sign", "60% center"),
  "fire-alarm-maintenance-basics": img("resources/manual-call-point-and-sign", 1200, 1754, "Fire alarm manual call point beneath a fire alarm call point sign", "center 55%"),
  "planning-an-amc": img("resources/fire-extinguishers-awaiting-service", 1200, 900, "Group of fire extinguishers gathered together outdoors"),
  "emergency-preparedness-for-workplaces": img("resources/illuminated-emergency-exit-sign", 1200, 901, "Illuminated green emergency exit sign with a running figure and arrow"),
  "industrial-fire-safety-faqs": img("resources/process-plant-at-night", 1200, 800, "Process plant towers and lighting at night"),
  "fire-safety-checklist-for-facility-managers": img("resources/workers-reviewing-safety-checklist", 1200, 800, "Two workers in hard hats and high-visibility vests reviewing a clipboard on site"),
};

export function allSiteImages(): SiteImage[] {
  return [
    ...Object.values(generalImages),
    ...Object.values(serviceImages),
    ...Object.values(industryImages),
    ...Object.values(equipmentCategoryImages).filter((i): i is SiteImage => i !== null),
    ...Object.values(resourceImages),
    ...Object.values(equipmentItemImages).filter((i): i is SiteImage => i !== null),
    aboutImage,
    companyBannerImage,
    homeHeroImages.desktop,
    ...(homeHeroImages.mobile ? [homeHeroImages.mobile] : []),
  ];
}
