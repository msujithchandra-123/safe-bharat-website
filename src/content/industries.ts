import type { Industry } from "@/types/content";

/**
 * Typical fire safety needs are described in general terms. No compliance
 * outcome is promised; requirements depend on the occupancy, the applicable
 * codes and the local authority.
 */
export const industries: Industry[] = [
  {
    slug: "manufacturing",
    title: "Manufacturing",
    seoTitle: "Fire Protection for Manufacturing Plants",
    seoDescription: "Extinguishers, fire alarm, hydrant and hose reel protection, AMC and shift-team training for manufacturing sites, planned around production schedules.",
    icon: "factory",
    summary: "Production halls, utilities and stores where machinery, electrical loads and combustible materials share the same space.",
    intro:
      "Manufacturing sites combine heat sources, electrical equipment, combustible raw materials and finished goods, often running continuously. Fire protection has to suit each area, from the shop floor to the utility block.",
    typicalNeeds: [
      "Extinguishers suited to machinery, electrical panels and material stores",
      "Detection and alarm coverage across production and storage areas",
      "Hydrant and hose reel protection sized for the site",
      "Planned maintenance that fits production schedules",
      "Training for shift teams and fire wardens",
    ],
    howWeHelp: [
      "Site surveys that map hazards area by area",
      "Supply, installation and commissioning of the protection required",
      "AMC coverage across extinguishers, alarms and fixed systems",
      "Training sessions planned around shifts",
    ],
    relevantServices: ["fire-extinguishers", "fire-alarm-systems", "fire-protection-systems", "amc-maintenance", "fire-safety-training"],
    faqs: [
      {
        question: "Can maintenance be scheduled around production?",
        answer: "Yes. We plan maintenance visits with your team to keep disruption to a minimum, and we follow your permit-to-work requirements.",
      },
    ],
  },
  {
    slug: "chemical-fertilizer-plants",
    title: "Chemical & Fertilizer Plants",
    seoTitle: "Fire Protection for Chemical & Fertilizer Plants",
    seoDescription: "Hydrant and hose reel maintenance, fire crew for shutdowns, audits and extinguishers for chemical and fertilizer plants, within your permit-to-work system.",
    icon: "flask",
    summary: "Process facilities with flammable materials, storage areas and strict permit-to-work environments.",
    intro:
      "Chemical and fertilizer facilities handle materials and processes that need careful fire protection planning and disciplined maintenance. All work has to fit the site's process safety and permit-to-work systems.",
    typicalNeeds: [
      "Fire protection for storage, loading and process areas",
      "Extinguishers and agents suited to the materials handled",
      "Hydrant network testing and maintenance",
      "Fire watch support during shutdowns and hot work",
      "Emergency preparedness training",
    ],
    howWeHelp: [
      "Work planned within your permit-to-work and isolation procedures",
      "Testing and maintenance of hydrant and hose reel systems",
      "Fire crew deployment for shutdowns and turnarounds",
      "Audits and practical recommendations",
    ],
    relevantServices: ["fire-protection-systems", "fire-crew", "fire-safety-audits", "amc-maintenance", "fire-extinguishers"],
    faqs: [
      {
        question: "Do you provide fire watch during shutdowns?",
        answer: "Yes. Our fire crew service provides personnel for planned activities. Duties, manpower and duration are agreed for each engagement.",
      },
    ],
  },
  {
    slug: "pharmaceutical",
    title: "Pharmaceutical Facilities",
    seoTitle: "Fire Protection for Pharmaceutical Facilities",
    seoDescription: "Fire alarm testing, extinguishers and documented maintenance for pharmaceutical production areas, laboratories and solvent stores.",
    icon: "pill",
    summary: "Clean production areas, laboratories, solvent stores and warehouses that need protection without disrupting controlled environments.",
    intro:
      "Pharmaceutical sites have controlled production areas, laboratories, solvent handling and high-value stock. Fire protection has to work alongside cleanroom practice and documentation requirements.",
    typicalNeeds: [
      "Detection and alarm systems for production, laboratory and storage areas",
      "Extinguishers suited to laboratories, electrical rooms and solvent stores",
      "Well-documented maintenance records",
      "Coordinated access to controlled areas",
    ],
    howWeHelp: [
      "Maintenance planned in line with your access and gowning procedures",
      "Clear service reports for your records",
      "Alarm system testing and fault rectification",
    ],
    relevantServices: ["fire-alarm-systems", "fire-extinguishers", "amc-maintenance", "fire-safety-audits"],
    faqs: [
      {
        question: "Can your team work in controlled areas?",
        answer: "Our team follows your site's access, gowning and documentation procedures. Share them with us during planning so visits are prepared properly.",
      },
    ],
  },
  {
    slug: "commercial-buildings",
    title: "Commercial Buildings",
    seoTitle: "Fire Protection for Commercial Buildings",
    seoDescription: "Fire alarm installation and maintenance, extinguishers, AMC and staff drills for offices, malls, hotels, hospitals and mixed-use buildings.",
    icon: "building",
    summary: "Offices, malls, hotels, hospitals and mixed-use buildings where many occupants depend on early warning and clear escape routes.",
    intro:
      "Commercial and public buildings have large numbers of occupants, many unfamiliar with the building. Early detection, working alarms, accessible extinguishers and clear escape routes are essential.",
    typicalNeeds: [
      "Fire alarm systems with full coverage and reliable notification",
      "Extinguishers positioned along corridors, in plant rooms and in kitchens",
      "Hydrant and sprinkler maintenance in larger buildings",
      "Evacuation drills and staff awareness",
    ],
    howWeHelp: [
      "Alarm installation, testing and maintenance",
      "Extinguisher supply, installation and servicing",
      "AMC coverage across multiple systems",
      "Staff training and drill support",
    ],
    relevantServices: ["fire-alarm-systems", "fire-extinguishers", "amc-maintenance", "fire-safety-training", "fire-protection-systems"],
    faqs: [
      {
        question: "Can you maintain systems in an occupied building?",
        answer: "Yes. We plan testing with building management so occupants are informed and disruption is kept to a minimum.",
      },
    ],
  },
  {
    slug: "warehouses-logistics",
    title: "Warehouses & Logistics",
    seoTitle: "Fire Protection for Warehouses & Logistics",
    seoDescription: "Detection, hydrant and sprinkler protection, extinguishers and audits for warehouses, planned around racking, storage layout, docks and charging areas.",
    icon: "warehouse",
    summary: "Large storage volumes, racking and vehicle movement, where fire can spread quickly through stored goods.",
    intro:
      "Warehouses store large quantities of goods in compact spaces, often with racking, packaging materials and vehicle movement. Without effective protection, a fire can spread quickly through stored goods.",
    typicalNeeds: [
      "Detection coverage suited to high ceilings and racking",
      "Hydrant and sprinkler protection appropriate to the storage",
      "Extinguishers near charging areas, docks and offices",
      "Housekeeping and access reviews",
    ],
    howWeHelp: [
      "Surveys that consider layout, storage and access",
      "Supply, installation and maintenance of the protection required",
      "Audits with practical housekeeping recommendations",
    ],
    relevantServices: ["fire-protection-systems", "fire-alarm-systems", "fire-extinguishers", "fire-safety-audits", "amc-maintenance"],
    faqs: [
      {
        question: "Does a change in stored goods affect fire protection?",
        answer: "It can. Changes in storage height, layout or the type of goods may change what protection is appropriate. A review after such changes is good practice.",
      },
    ],
  },
  {
    slug: "infrastructure-industrial",
    title: "Infrastructure & Industrial Facilities",
    seoTitle: "Fire Protection for Industrial Infrastructure",
    seoDescription: "Fixed system and fire pump maintenance, installation and commissioning support, and fire crew for utilities, port-linked, power and process facilities.",
    icon: "construction",
    summary: "Utilities, port-linked facilities, power and process infrastructure, and project sites with demanding operating conditions.",
    intro:
      "Infrastructure and heavy industrial facilities operate at scale, often across large sites with remote areas and demanding conditions. Fire protection must be robust and well maintained, with documentation that can be traced.",
    typicalNeeds: [
      "Hydrant networks and fire pump maintenance across large sites",
      "Extinguishers for substations, control rooms and workshops",
      "Fire crew for planned high-risk activities",
      "Periodic audits and maintenance records",
    ],
    howWeHelp: [
      "Installation and commissioning support for projects",
      "Maintenance of fixed systems and portable equipment",
      "Fire crew deployment for planned activities",
    ],
    relevantServices: ["fire-protection-systems", "installation-commissioning", "fire-crew", "amc-maintenance", "fire-safety-audits"],
    faqs: [
      {
        question: "Can you support project sites?",
        answer: "Yes. We can provide installation, commissioning and fire crew support for project sites, subject to scope and schedule.",
      },
    ],
  },
];

export function getIndustry(slug: string): Industry | undefined {
  return industries.find((i) => i.slug === slug);
}

export function getIndustries(slugs: readonly string[]): Industry[] {
  return slugs.map((slug) => getIndustry(slug)).filter((i): i is Industry => Boolean(i));
}
