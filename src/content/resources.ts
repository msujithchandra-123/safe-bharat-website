import type { Resource } from "@/types/content";

/**
 * General fire safety guidance. Every article stays `review: { status: "pending" }`
 * until a qualified reviewer has checked it against the current Indian
 * Standards, the national building standards (SP 7:2026) and local fire service requirements.
 * Pending articles render a review notice, are noindex and are excluded from
 * the sitemap.
 */
export const resources: Resource[] = [
  {
    slug: "choosing-the-right-fire-extinguisher",
    title: "Choosing the Right Fire Extinguisher",
    category: "Guide",
    summary: "How extinguisher types differ, how to match them to the fire risks in each area, and common mistakes to avoid.",
    readingMinutes: 5,
    relatedServices: ["fire-extinguishers", "fire-safety-training"],
    review: { status: "pending" },
    sections: [
      {
        heading: "Start with what could burn",
        blocks: [
          { type: "paragraph", text: "Extinguishers are designed for particular kinds of fire. Before choosing one, list what could burn in each area: ordinary combustibles such as wood, paper and textiles; flammable liquids; flammable gases; metals; cooking oils; and energised electrical equipment." },
          { type: "paragraph", text: "Most premises have more than one kind of risk, so the right answer is usually a mix of extinguisher types placed by area rather than one type everywhere." },
        ],
      },
      {
        heading: "Common extinguisher types",
        blocks: [
          {
            type: "list",
            items: [
              "Water type: for ordinary combustibles. Not for electrical equipment or flammable liquids.",
              "Mechanical foam: for flammable liquids and ordinary combustibles.",
              "ABC dry powder: multi-purpose and widely used, though the powder reduces visibility and leaves residue.",
              "Carbon dioxide (CO₂): leaves no residue, so it is often chosen for electrical and electronic equipment. Use with care in small enclosed spaces.",
            ],
          },
          { type: "callout", tone: "info", text: "Check the label on each extinguisher. It shows the fire classes the unit is rated for and how to operate it." },
        ],
      },
      {
        heading: "Placement matters as much as type",
        blocks: [
          { type: "paragraph", text: "Extinguishers should be easy to see and reach, close to the hazard they protect, and along routes people use to leave the area. They should not be blocked by stock, equipment or furniture." },
          { type: "paragraph", text: "The number, size and maximum travel distance to extinguishers are set out in the applicable code of practice. A site survey is the most reliable way to apply them to your layout." },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Using one extinguisher type for every area regardless of the risk",
              "Placing water extinguishers next to electrical panels",
              "Leaving discharged or damaged units in place",
              "Assuming staff know how to use an extinguisher without training",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "fire-alarm-maintenance-basics",
    title: "Fire Alarm System Maintenance: The Basics",
    category: "Checklist",
    summary: "Why fire alarm systems need routine attention, what in-house teams can check, and what needs a competent technician.",
    readingMinutes: 4,
    relatedServices: ["fire-alarm-systems", "amc-maintenance"],
    review: { status: "pending" },
    sections: [
      {
        heading: "Why maintenance matters",
        blocks: [
          { type: "paragraph", text: "A fire alarm system is made up of many devices, any of which can fail without being noticed. Detectors get contaminated, batteries age, cables get damaged during other work, and building changes can leave areas uncovered." },
        ],
      },
      {
        heading: "What your team can do",
        blocks: [
          {
            type: "list",
            items: [
              "Check the control panel regularly and record any fault or disablement indications",
              "Report faults promptly to your maintenance provider",
              "Keep a logbook of alarms, faults, tests and maintenance visits",
              "Make sure call points and detectors are not obstructed or covered",
              "Tell your maintenance provider about changes to the building layout or use",
            ],
          },
        ],
      },
      {
        heading: "What needs a competent technician",
        blocks: [
          { type: "paragraph", text: "Periodic functional testing of detectors, call points and sounders, battery and power supply checks, panel servicing and fault rectification should be carried out by trained technicians, at the intervals recommended by the applicable code and the manufacturer." },
          { type: "callout", tone: "warning", text: "Do not leave zones or devices disabled for longer than necessary. A disabled zone is an unprotected area." },
        ],
      },
    ],
  },
  {
    slug: "planning-an-amc",
    title: "Planning an Annual Maintenance Contract (AMC)",
    category: "Planning",
    summary: "What to prepare, what to ask for and what to check in an AMC proposal for fire protection systems.",
    readingMinutes: 4,
    relatedServices: ["amc-maintenance"],
    review: { status: "pending" },
    sections: [
      {
        heading: "List what needs to be covered",
        blocks: [
          { type: "paragraph", text: "Start with an equipment register: the number and types of extinguishers, the fire alarm system and its devices, hydrant and hose reel systems, sprinkler systems and fire pumps. A clear register makes proposals easier to compare." },
        ],
      },
      {
        heading: "Questions to ask",
        blocks: [
          {
            type: "list",
            items: [
              "Which systems and how much equipment does the contract cover?",
              "How often will each system be inspected and tested?",
              "How are breakdowns reported and attended?",
              "Which spare parts, consumables and refills are included, and which are charged separately?",
              "What report will we receive after each visit?",
            ],
          },
        ],
      },
      {
        heading: "Keep records",
        blocks: [
          { type: "paragraph", text: "Service reports, defect lists and the actions taken are valuable records. File them where they can be found quickly for audits, insurance reviews and inspections." },
        ],
      },
    ],
  },
  {
    slug: "emergency-preparedness-for-workplaces",
    title: "Emergency Preparedness for Workplaces",
    category: "Guide",
    summary: "The essentials of a workable fire emergency plan: raising the alarm, evacuation, assembly and drills.",
    readingMinutes: 5,
    relatedServices: ["fire-safety-training", "fire-safety-audits"],
    review: { status: "pending" },
    sections: [
      {
        heading: "Everyone should know four things",
        blocks: [
          {
            type: "list",
            items: [
              "How to raise the alarm",
              "The escape routes from their work area",
              "Where the assembly point is",
              "Who is responsible for coordinating evacuation and contacting the emergency services",
            ],
          },
          { type: "callout", tone: "warning", text: "In India, the national emergency number is 112. Call it as soon as a fire is discovered, even if you think it is under control." },
        ],
      },
      {
        heading: "Keep escape routes usable",
        blocks: [
          { type: "paragraph", text: "Escape routes and exits must stay unobstructed and unlocked when the building is occupied, with clear signage and lighting. Fire doors should close properly and must not be wedged open." },
        ],
      },
      {
        heading: "Practise",
        blocks: [
          { type: "paragraph", text: "Evacuation drills show whether the plan works in practice: whether the alarm can be heard everywhere, whether people use the right routes and how long evacuation takes. Record the results and fix what does not work." },
        ],
      },
      {
        heading: "Fight a fire only if it is safe",
        blocks: [
          { type: "paragraph", text: "Trained people may use an extinguisher on a small fire, but only after the alarm has been raised, if they have a clear escape route behind them and the fire is not spreading. If in doubt, get out and stay out." },
        ],
      },
    ],
  },
  {
    slug: "industrial-fire-safety-faqs",
    title: "Industrial Fire Safety FAQs",
    category: "FAQ",
    summary: "Answers to questions facility and safety managers often ask about fire protection, maintenance and preparedness.",
    readingMinutes: 4,
    relatedServices: ["fire-safety-audits", "amc-maintenance", "fire-protection-systems"],
    review: { status: "pending" },
    sections: [
      {
        heading: "About these answers",
        blocks: [
          { type: "paragraph", text: "These are general answers. Specific requirements depend on your occupancy, processes, the applicable codes and the local fire authority, so confirm them for your site." },
        ],
      },
    ],
    faqs: [
      {
        question: "How often should fire protection equipment be maintained?",
        answer: "Intervals depend on the equipment and are set out in the applicable codes of practice and the manufacturer's instructions. A maintenance provider should agree a schedule that reflects both.",
      },
      {
        question: "Do changes to our plant affect fire protection?",
        answer: "Often they do. New processes, storage, partitions or occupancy can change what protection is appropriate. Review fire protection whenever significant changes are planned.",
      },
      {
        question: "Who should be trained in fire safety?",
        answer: "Everyone on site needs basic awareness of how to raise the alarm and evacuate. Fire wardens, supervisors and emergency team members need further training suited to their role.",
      },
      {
        question: "Is a fire safety audit the same as a fire NOC?",
        answer: "No. A No Objection Certificate is issued by the relevant fire authority. An audit is a review of your arrangements that can help you prepare.",
      },
    ],
  },
  {
    slug: "fire-safety-checklist-for-facility-managers",
    title: "A Fire Safety Checklist for Facility Managers",
    category: "Checklist",
    summary: "A practical walk-round checklist covering equipment, escape routes, housekeeping and records.",
    readingMinutes: 3,
    relatedServices: ["fire-safety-audits", "amc-maintenance", "fire-extinguishers"],
    review: { status: "pending" },
    sections: [
      {
        heading: "Equipment",
        blocks: [
          {
            type: "list",
            items: [
              "Extinguishers in their positions, visible, unobstructed and within service date",
              "Fire alarm panel showing normal, with no unexplained faults or disablements",
              "Hydrant and hose reel points accessible, with hoses and nozzles present",
              "Sprinkler heads not painted, damaged or obstructed by stock",
            ],
          },
        ],
      },
      {
        heading: "Escape routes",
        blocks: [
          { type: "list", items: ["Exits unlocked and unobstructed during occupancy", "Exit signage visible", "Fire doors closing properly and not wedged open"] },
        ],
      },
      {
        heading: "Housekeeping",
        blocks: [
          { type: "list", items: ["Waste and packaging removed regularly", "Flammable materials stored in designated areas", "Electrical panels clear of stored materials"] },
        ],
      },
      {
        heading: "Records",
        blocks: [
          { type: "list", items: ["Maintenance and service reports filed", "Training and drill records up to date", "Defects tracked to closure"] },
        ],
      },
    ],
  },
];

export function getResource(slug: string): Resource | undefined {
  return resources.find((r) => r.slug === slug);
}

export function isIndexable(resource: Resource): boolean {
  return resource.review.status === "approved";
}
