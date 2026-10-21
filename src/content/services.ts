import type { ProcessStep, Service } from "@/types/content";

/**
 * Service lines published on the official Safe Bharat banner:
 * Fire Extinguishers · Fire Protection System · Fire Alarm Systems ·
 * Fire & Safety Training · Safety Audit & Consultancy ·
 * Installation, Servicing & Maintenance · Fire & Safety Equipment Supply · Fire Crew.
 *
 * Copy describes typical scope in general terms. Contract-specific details
 * (visit frequency, response times, exclusions, pricing) are deliberately not
 * published until Safe Bharat confirms them — see docs/CONTENT_REVIEW.md.
 */

const standardProcess: ProcessStep[] = [
  { title: "Site survey", description: "We visit the site to understand the occupancy, layout, existing equipment and the hazards involved." },
  { title: "Requirement assessment", description: "We confirm what needs protection and what the applicable codes and local authority expect." },
  { title: "Proposal", description: "You receive a written scope and quotation covering equipment, work and documentation." },
  { title: "Execution", description: "Supply, installation or servicing is carried out by our team in coordination with your site safety procedures." },
  { title: "Testing and handover", description: "Work is tested, recorded and handed over with the relevant documentation." },
  { title: "Ongoing support", description: "Periodic maintenance and an AMC keep the system ready for use." },
];

/**
 * Gazette of India (Extraordinary, Part III, Sec. 4), BIS notification
 * CG-DL-E-30042026-272177: SP 7:2026 "National Building Construction Standards
 * 2026" established on 30 April 2026, and SP 7:2016 "National Building Code of
 * India 2016" withdrawn on the same date. The part of SP 7:2026 that covers fire
 * and life safety, and the edition Andhra Pradesh applies, are not yet verified,
 * so neither is stated (docs/CONTENT_REVIEW.md, item R1).
 */
const BUILDING_STANDARDS: Service["referenceStandards"][number] = {
  code: "SP 7:2026",
  title:
    "National Building Construction Standards 2026, established by BIS on 30 April 2026. BIS withdrew the National Building Code of India 2016 (SP 7:2016) on the same date.",
  source: { label: "Gazette of India notification, 30 April 2026", href: "https://egazette.gov.in/WriteReadData/2026/272177.pdf" },
};

export const services: Service[] = [
  {
    slug: "fire-extinguishers",
    title: "Fire Extinguishers",
    shortTitle: "Fire Extinguishers",
    seoTitle: "Fire Extinguisher Supply & Refilling, Visakhapatnam",
    seoDescription: "Hazard-based selection, supply, installation, servicing and refilling of portable fire extinguishers for industrial and commercial sites in Visakhapatnam.",
    icon: "fireExtinguisher",
    summary: "Selection, supply, installation, refilling and servicing of portable fire extinguishers matched to the hazards on your site.",
    heroIntro:
      "The right extinguisher, in the right place, in working condition. We help you select, install and maintain portable extinguishers that suit the fire risks in each area of your facility.",
    overview: [
      "Portable extinguishers are the first line of response to a small fire. They only help if the extinguishing agent suits the fire risk, the units are where people can reach them, and they have been maintained.",
      "Safe Bharat supplies and installs extinguishers for factories, plants, warehouses, offices and commercial buildings, and services existing units so they stay ready for use.",
    ],
    customerNeeds: [
      "New premises or expansions that need extinguishers selected and positioned",
      "Existing extinguishers that are due for inspection, refilling or replacement",
      "Areas with specific risks such as electrical rooms, fuel storage or kitchens",
      "Documentation of extinguisher condition for internal or external inspections",
    ],
    scope: [
      "Hazard-based selection of extinguisher type and capacity",
      "Supply of new extinguishers",
      "Installation with wall mounting, stands and signage",
      "Periodic inspection and servicing",
      "Refilling after use or at the end of the refill interval",
      "Replacement recommendations for units that are no longer serviceable",
    ],
    deliverables: [
      "Extinguisher schedule listing type, location and service status",
      "Service tags on each unit serviced",
      "Inspection and service records for your files",
      "Recommendations for gaps or replacements",
    ],
    applications: ["Production areas", "Electrical and control rooms", "Fuel and solvent stores", "Offices and corridors", "Warehouses", "Kitchens and canteens"],
    process: standardProcess,
    referenceStandards: [
      { code: "IS 2190", title: "Selection, installation and maintenance of first-aid fire extinguishers — Code of practice" },
      { code: "IS 15683", title: "Portable fire extinguishers — Performance and construction — Specification" },
    ],
    faqs: [
      {
        question: "How do I know which extinguisher type I need?",
        answer: "It depends on what could burn in each area: ordinary combustibles, flammable liquids, gases or energised electrical equipment. We assess each area during the site survey and recommend the type and capacity.",
      },
      {
        question: "Can you service extinguishers that you did not supply?",
        answer: "Tell us the make, type and quantity when you enquire. We will confirm whether we can service them after we have inspected the units.",
      },
      {
        question: "Do you refill extinguishers after they have been used?",
        answer: "Yes, refilling is part of our extinguisher service. A unit that has been discharged, even partially, should be refilled before it goes back into service.",
      },
      {
        question: "What types of fire extinguisher do you supply?",
        answer: "Our range includes ABC dry powder, carbon dioxide (CO₂), water-type and mechanical foam extinguishers. The capacity, rating and make for each area are selected for your requirement and confirmed in our quotation.",
        links: [{ label: "ABC dry powder", href: "/equipment/abc-dry-powder-extinguisher" }, { label: "CO₂", href: "/equipment/co2-extinguisher" }, { label: "Water-type", href: "/equipment/water-type-extinguisher" }, { label: "Mechanical foam", href: "/equipment/mechanical-foam-extinguisher" }],
      },
      {
        question: "Which fire extinguisher is suitable for electrical equipment?",
        answer: "CO₂ extinguishers are often chosen for electrical rooms, control panels and server areas because they leave no residue. Water-type extinguishers are not suitable for energised electrical equipment. CO₂ displaces oxygen, so units should be positioned and used with care in small, enclosed spaces. The choice for each area should follow a site assessment and IS 2190.",
        links: [{ label: "CO₂ fire extinguisher", href: "/equipment/co2-extinguisher" }],
      },
      {
        question: "How often do fire extinguishers need inspection and servicing?",
        answer: "Inspection and maintenance of first-aid extinguishers are covered by IS 2190 and the manufacturer's instructions. Under an Annual Maintenance Contract we agree the inspection and servicing schedule with you and record the status of every unit.",
        links: [{ label: "AMC & maintenance", href: "/services/amc-maintenance" }],
      },
    ],
    relatedServices: ["amc-maintenance", "fire-safety-equipment-supply", "fire-safety-training"],
    industries: ["manufacturing", "warehouses-logistics", "commercial-buildings", "chemical-fertilizer-plants"],
    equipmentCategories: ["fire-extinguishers"],
    primaryCta: "quote",
  },
  {
    slug: "fire-protection-systems",
    title: "Fire Protection Systems",
    shortTitle: "Protection Systems",
    seoTitle: "Fire Hydrant & Sprinkler Systems in Visakhapatnam",
    seoDescription: "Supply, installation, testing and maintenance of fire hydrant, hose reel and automatic sprinkler systems for industrial and commercial sites in Visakhapatnam.",
    icon: "showerHead",
    summary: "Fire hydrant, hose reel and automatic sprinkler systems for industrial and commercial facilities, from design input to commissioning.",
    heroIntro:
      "Water-based fixed fire protection, from hydrant networks and hose reels to automatic sprinklers. These systems need to work the first time they are called on.",
    overview: [
      "Fixed fire protection systems contain and control fires that grow beyond what a portable extinguisher can handle. Their reliability depends on correct design, good installation and regular testing of pumps, valves, piping and outlets.",
      "Safe Bharat supports facilities with the supply, installation, testing and maintenance of hydrant, hose reel and sprinkler systems, coordinated with your engineering and project teams.",
    ],
    customerNeeds: [
      "New plants or buildings that need hydrant or sprinkler protection",
      "Extensions or layout changes to an existing system",
      "Systems that have not been tested recently or show faults",
      "Pump, valve or hose components that need replacement",
    ],
    scope: [
      "Fire hydrant systems: internal and external hydrants, landing valves, hoses and branch pipes",
      "First-aid hose reel systems",
      "Automatic sprinkler systems",
      "Fire pump sets and associated valves and fittings, supplied as part of system projects",
      "Pressure testing, flow checks and commissioning",
      "Repairs, modifications and extensions",
    ],
    deliverables: [
      "Agreed scope and bill of materials",
      "Installation as per approved drawings",
      "Test and commissioning records",
      "As-installed information and operating guidance for your team",
    ],
    applications: ["Manufacturing plants", "Chemical and process facilities", "Warehouses", "High-occupancy commercial buildings", "Industrial infrastructure"],
    process: standardProcess,
    referenceStandards: [
      BUILDING_STANDARDS,
      { code: "IS 13039", title: "External hydrant systems — Provision and maintenance — Code of practice" },
      { code: "IS 15105", title: "Design and installation of fixed automatic sprinkler fire extinguishing systems — Specification" },
    ],
    faqs: [
      {
        question: "Do you design fire protection systems?",
        answer: "We provide engineering input from the site survey through to execution. For projects that need approved drawings from a designated consultant or authority, we work to those drawings and coordinate with the consultant.",
      },
      {
        question: "Can you test an existing hydrant or sprinkler system?",
        answer: "Yes. Testing and maintenance of existing systems is part of our service. We will ask for system details and drawings, if available, before the visit.",
      },
      {
        question: "What is the difference between a fire hydrant system and a sprinkler system?",
        answer: "A hydrant system provides outlets, called landing valves, that firefighting hoses connect to, so trained people can fight a fire with a large water supply. A first-aid hose reel gives trained occupants a smaller, continuous supply for early firefighting. A sprinkler system is automatic: sprinkler heads on the pipe network discharge water over the fire area without anyone operating them. Many larger sites use more than one.",
        links: [{ label: "Hydrant landing valves", href: "/equipment/hydrant-landing-valves" }, { label: "First-aid hose reels", href: "/equipment/first-aid-hose-reels" }, { label: "Sprinkler heads", href: "/equipment/sprinkler-heads" }],
      },
      {
        question: "What does a fire pump set do?",
        answer: "A fire pump set supplies the water pressure for hydrant and sprinkler systems. Whether a system needs its own pumps, and their size, is decided in the system design. We supply pump sets as part of system projects.",
        links: [{ label: "Fire pump sets", href: "/equipment/fire-pump-sets" }],
      },
      {
        question: "Which standards apply to hydrant and sprinkler systems in India?",
        answer: "Commonly referenced documents include SP 7:2026, the National Building Construction Standards (established on 30 April 2026, when BIS withdrew the National Building Code of India 2016), IS 13039 for external hydrant systems and IS 15105 for sprinkler systems. Which requirements and editions apply to your site depends on its occupancy, hazards and the local fire authority, and we confirm them for each project.",
      },
    ],
    relatedServices: ["installation-commissioning", "amc-maintenance", "fire-alarm-systems"],
    industries: ["manufacturing", "chemical-fertilizer-plants", "warehouses-logistics", "infrastructure-industrial", "pharmaceutical"],
    equipmentCategories: ["hydrant-equipment", "sprinkler-equipment", "fire-pumps"],
    primaryCta: "quote",
  },
  {
    slug: "fire-alarm-systems",
    title: "Fire Alarm Systems",
    shortTitle: "Fire Alarm Systems",
    seoTitle: "Fire Alarm & Detection Systems in Visakhapatnam",
    seoDescription: "Conventional and addressable fire alarm systems: detectors, call points, sounders and panels supplied, installed, tested and maintained in Visakhapatnam.",
    icon: "bellRing",
    summary: "Fire detection and alarm systems with detectors, manual call points, sounders and control panels. Installed, tested and maintained.",
    heroIntro:
      "Early warning gives people time to leave and lets your team respond while a fire is still small. We install and maintain detection and alarm systems that suit the layout and use of your building.",
    overview: [
      "A fire detection and alarm system is a network of detectors, manual call points, sounders and a control panel. It is only as reliable as its weakest device, so placement, wiring, programming and regular testing all matter.",
      "Safe Bharat supplies, installs, tests and maintains fire alarm systems for industrial, commercial and institutional buildings, including conventional and addressable systems.",
    ],
    customerNeeds: [
      "New buildings or floors that need detection and alarm coverage",
      "Frequent false alarms or panel faults",
      "Older systems that need upgrading or extending",
      "Periodic testing and maintenance records",
    ],
    scope: [
      "Conventional and addressable fire alarm control panels",
      "Smoke, heat and multi-sensor detectors",
      "Manual call points, hooters, sounders and strobes",
      "Cabling, installation and panel programming",
      "Functional testing, cause-and-effect checks and commissioning",
      "Fault finding, repairs and system extensions",
    ],
    deliverables: [
      "Device schedule and zone or loop information",
      "Test and commissioning records",
      "Operator guidance for your security or maintenance staff",
      "Maintenance reports with any issues and recommended actions",
    ],
    applications: ["Factories and process areas", "Offices and commercial buildings", "Warehouses", "Electrical rooms and server rooms", "Hostels and institutional buildings"],
    process: standardProcess,
    referenceStandards: [
      BUILDING_STANDARDS,
      { code: "IS 2189", title: "Selection, installation and maintenance of automatic fire detection and alarm system — Code of practice" },
    ],
    faqs: [
      {
        question: "What is the difference between conventional and addressable systems?",
        answer: "A conventional system reports alarms by zone, so you know the area but not the exact device. An addressable system identifies the individual device, which speeds up response and fault finding in larger buildings. We will recommend one based on the size and layout of your site.",
      },
      {
        question: "Our system keeps giving false alarms. Can you help?",
        answer: "Yes. False alarms are usually caused by detector type, placement, contamination or wiring faults. We inspect the system, find the cause and recommend corrective work.",
      },
      {
        question: "What does a fire alarm system include?",
        answer: "A fire detection and alarm system is a network of automatic detectors, manual call points, sounders or strobes and a control panel that monitors them. Placement, wiring, programming and regular testing decide how reliable it is.",
        links: [{ label: "Control panels", href: "/equipment/fire-alarm-control-panel" }, { label: "Manual call points", href: "/equipment/manual-call-points" }, { label: "Hooters & sounders", href: "/equipment/hooters-and-sounders" }],
      },
      {
        question: "Should I use smoke detectors or heat detectors?",
        answer: "Smoke detectors give early warning of smouldering and flaming fires and suit areas such as offices, corridors and server rooms. Heat detectors are used where smoke detectors could cause false alarms, such as kitchens and some process areas. Detector type and spacing depend on the room height, use and environment. IS 2189 covers their selection and installation.",
        links: [{ label: "Smoke detectors", href: "/equipment/smoke-detectors" }, { label: "Heat detectors", href: "/equipment/heat-detectors" }],
      },
      {
        question: "How often should a fire alarm system be tested?",
        answer: "Testing and maintenance routines are set out in IS 2189 and the manufacturer's instructions. Under an AMC we agree the schedule in writing and give you a report after each visit.",
        links: [{ label: "AMC & maintenance", href: "/services/amc-maintenance" }],
      },
    ],
    relatedServices: ["installation-commissioning", "amc-maintenance", "fire-protection-systems"],
    industries: ["commercial-buildings", "manufacturing", "pharmaceutical", "warehouses-logistics"],
    equipmentCategories: ["fire-alarm-equipment"],
    primaryCta: "quote",
  },
  {
    slug: "installation-commissioning",
    title: "Installation & Commissioning",
    shortTitle: "Installation",
    seoTitle: "Fire System Installation & Commissioning",
    seoDescription: "Installation, pressure and functional testing, and commissioning of fire alarm, hydrant, hose reel and sprinkler systems, planned around your site safety rules.",
    icon: "wrench",
    summary: "Installation, testing and commissioning of fire protection and alarm systems, coordinated with your site and project teams.",
    heroIntro:
      "Good equipment can still fail if it is installed badly. We install, test and commission fire protection systems carefully, working within your site safety rules.",
    overview: [
      "Installation is where design becomes a working system. Pipe routing, supports, cabling, device placement and the final tests decide whether a system performs when it is needed.",
      "Our team carries out installation and commissioning for fire alarm, hydrant, hose reel, sprinkler and extinguisher installations, coordinating with your project engineers, contractors and safety department.",
    ],
    customerNeeds: [
      "New-build or expansion projects with approved drawings",
      "Equipment that has been procured and needs to be installed",
      "Systems installed by others that need to be tested and commissioned",
      "Projects that need work done within plant permit-to-work procedures",
    ],
    scope: [
      "Site mobilisation in line with your permit-to-work and safety requirements",
      "Installation of piping, valves, outlets, devices, cabling and panels",
      "Pressure testing, flushing and functional testing",
      "Commissioning and joint inspection with your team",
      "Handover documentation and operator familiarisation",
    ],
    deliverables: [
      "Installation and test records",
      "Commissioning report",
      "Handover documentation for the systems installed",
      "Familiarisation session for your operating staff",
    ],
    applications: ["Greenfield projects", "Plant expansions", "Building fit-outs", "System upgrades and retrofits"],
    process: standardProcess,
    referenceStandards: [BUILDING_STANDARDS],
    faqs: [
      {
        question: "Can you work inside an operating plant?",
        answer: "Yes. We plan the work around your permit-to-work, isolation and hot-work procedures. Tell us your site requirements when you enquire so they are part of the plan from the start.",
      },
      {
        question: "Do you provide commissioning documentation?",
        answer: "Yes. Test and commissioning records are part of the handover for every installation we carry out.",
      },
      {
        question: "What does commissioning a fire protection system involve?",
        answer: "After installation, the system is pressure tested, flushed and functionally tested, then inspected jointly with your team. Handover includes the test and commissioning records, documentation for the installed systems and a familiarisation session for your operating staff.",
      },
      {
        question: "Can you install equipment we have already bought?",
        answer: "Yes. We install equipment that has already been procured, and we can test and commission systems installed by others. Share the equipment list and approved drawings when you enquire.",
      },
    ],
    relatedServices: ["fire-protection-systems", "fire-alarm-systems", "amc-maintenance"],
    industries: ["manufacturing", "chemical-fertilizer-plants", "infrastructure-industrial", "commercial-buildings"],
    equipmentCategories: ["hydrant-equipment", "fire-alarm-equipment", "sprinkler-equipment"],
    primaryCta: "quote",
  },
  {
    slug: "amc-maintenance",
    title: "AMC & Maintenance",
    shortTitle: "AMC & Maintenance",
    seoTitle: "Fire Safety AMC & Maintenance in Visakhapatnam",
    seoDescription: "Annual Maintenance Contracts for fire extinguishers, fire alarm, hydrant and sprinkler systems, with scheduled servicing and a report after every visit.",
    icon: "calendarCheck",
    summary: "Annual Maintenance Contracts and servicing that keep extinguishers, alarms, hydrants and sprinklers ready for use, with records you can rely on.",
    heroIntro:
      "Fire protection still needs looking after once it is installed. An Annual Maintenance Contract (AMC) gives you planned inspections, servicing and records for the systems that protect your people and property.",
    overview: [
      "Fire protection equipment is rarely used, which means faults can go unnoticed until an emergency. Planned maintenance finds those faults first.",
      "Safe Bharat offers Annual Maintenance Contracts and on-call servicing for portable extinguishers, fire alarm systems, hydrant and hose reel systems, and sprinkler systems. Each contract is tailored to the equipment on site.",
    ],
    customerNeeds: [
      "Planned maintenance for multiple fire safety systems under one contract",
      "Consistent service records for audits and inspections",
      "A single point of contact for faults and breakdowns",
      "Takeover of maintenance from a previous vendor",
    ],
    scope: [
      "Scheduled inspection and servicing of covered equipment",
      "Functional testing of alarm devices, panels, pumps and valves",
      "Extinguisher inspection, servicing and refilling as per contract",
      "Fault attendance for covered systems",
      "Reporting on condition, defects and recommended corrective work",
    ],
    deliverables: [
      "Maintenance schedule agreed at the start of the contract",
      "Service report after each visit",
      "Defect and recommendation list",
      "Equipment register for the covered systems",
    ],
    applications: ["Factories and plants", "Warehouses", "Commercial and office buildings", "Hospitals, hostels and institutions"],
    process: [
      { title: "Equipment survey", description: "We list the systems and equipment to be covered and record their current condition." },
      { title: "Contract proposal", description: "You receive a written proposal setting out coverage, visit frequency, reporting and commercial terms." },
      { title: "Scheduled maintenance", description: "Our team carries out planned visits and records the work done on each system." },
      { title: "Reporting", description: "Each visit ends with a report of findings, defects and recommended actions." },
      { title: "Review and renewal", description: "We review the contract with you before renewal so it reflects changes on site." },
    ],
    referenceStandards: [
      { code: "IS 2190", title: "Selection, installation and maintenance of first-aid fire extinguishers — Code of practice" },
      { code: "IS 2189", title: "Selection, installation and maintenance of automatic fire detection and alarm system — Code of practice" },
    ],
    contractNote:
      "Visit frequency, systems covered, response arrangements, exclusions (such as spare parts and consumables) and reporting format are agreed in writing in each AMC proposal. Nothing on this page replaces the terms of your contract.",
    faqs: [
      {
        question: "What does an AMC cover?",
        answer: "Coverage is set out in your contract. Typically it includes scheduled inspection and servicing of the agreed systems, with reports after each visit. Spare parts, consumables and major repairs are often quoted separately. Your proposal will state exactly what is included.",
      },
      {
        question: "How often will you visit?",
        answer: "Visit frequency depends on the systems covered and the applicable standards. We agree it with you and write it into the contract.",
      },
      {
        question: "Can you take over maintenance from our current vendor?",
        answer: "Yes. We start with a survey of the existing equipment and its records so the handover is clear.",
      },
      {
        question: "Why do fire protection systems need an AMC?",
        answer: "Fire protection equipment is rarely used, so faults can go unnoticed until an emergency. An Annual Maintenance Contract gives you planned inspection and servicing that finds those faults first, and consistent records for audits and inspections.",
      },
      {
        question: "Which systems can one AMC cover?",
        answer: "One contract can cover portable fire extinguishers, fire alarm systems, hydrant and hose reel systems and sprinkler systems. Each contract is tailored to the equipment on your site.",
        links: [{ label: "Fire extinguishers", href: "/services/fire-extinguishers" }, { label: "Fire alarm systems", href: "/services/fire-alarm-systems" }, { label: "Hydrant & sprinkler systems", href: "/services/fire-protection-systems" }],
      },
    ],
    relatedServices: ["fire-extinguishers", "fire-alarm-systems", "fire-protection-systems"],
    industries: ["manufacturing", "commercial-buildings", "warehouses-logistics", "pharmaceutical", "chemical-fertilizer-plants"],
    equipmentCategories: ["fire-extinguishers", "fire-alarm-equipment", "hydrant-equipment"],
    primaryCta: "amc",
  },
  {
    slug: "fire-safety-audits",
    title: "Fire Safety Audit & Consultancy",
    shortTitle: "Audit & Consultancy",
    seoTitle: "Fire Safety Audit & Consultancy in Visakhapatnam",
    seoDescription: "Fire safety audits for factories, warehouses and commercial buildings: a site inspection, a written report and prioritised recommendations.",
    icon: "clipboardCheck",
    summary: "Structured fire safety inspections and practical advice that show where your facility stands and what to do next.",
    heroIntro:
      "A clear, independent view of your fire safety arrangements. Our audits look at equipment, systems, housekeeping and preparedness, and turn findings into a prioritised list of actions.",
    overview: [
      "Fire risk changes as facilities change: new processes, new storage, altered layouts and more people. A periodic fire safety audit checks that protection and procedures have kept up.",
      "Safe Bharat carries out site inspections and provides consultancy on fire protection needs, equipment selection and improvement plans. We report findings in plain language with practical recommendations.",
    ],
    customerNeeds: [
      "A baseline review before upgrading fire protection",
      "Preparation for a customer, insurer or internal inspection",
      "Review after a change in process, storage or layout",
      "Independent advice on what to prioritise within a budget",
    ],
    scope: [
      "Walk-through inspection of the premises",
      "Review of portable extinguishers, alarm and fixed protection systems",
      "Review of escape routes, signage and emergency arrangements",
      "Housekeeping and storage observations relevant to fire risk",
      "Discussion of findings with your team",
    ],
    deliverables: [
      "Written audit report with observations",
      "Prioritised recommendations",
      "Guidance on next steps such as equipment, training or maintenance",
    ],
    applications: ["Factories and plants", "Warehouses", "Commercial buildings", "Institutions"],
    process: [
      { title: "Scoping", description: "We agree the areas, systems and records to be reviewed." },
      { title: "Site inspection", description: "We inspect the premises and talk with your team about how the site operates." },
      { title: "Report", description: "We share observations and prioritised recommendations in a written report." },
      { title: "Follow-up", description: "If you want help implementing the recommendations, we can propose it." },
    ],
    referenceStandards: [BUILDING_STANDARDS],
    contractNote:
      "An audit records observations at the time of inspection. It is not a statutory fire NOC and does not replace inspections or approvals required by the fire service or other authorities.",
    faqs: [
      {
        question: "Is your audit the same as a fire NOC?",
        answer: "No. A fire No Objection Certificate is issued by the relevant fire authority. Our audit is an independent review that helps you understand and improve your arrangements.",
      },
      {
        question: "How long does an audit take?",
        answer: "It depends on the size and complexity of the site. We will estimate the time once the scope is agreed.",
      },
      {
        question: "What does a fire safety audit cover?",
        answer: "A walk-through inspection of the premises; a review of portable extinguishers, alarm and fixed protection systems; escape routes, signage and emergency arrangements; and housekeeping and storage that affect fire risk. Findings are discussed with your team and set out in a written report with prioritised recommendations.",
      },
      {
        question: "When should a facility have a fire safety audit?",
        answer: "Common triggers are before upgrading fire protection, before a customer, insurer or internal inspection, and after a change in process, storage or layout. Fire risk changes as facilities change, so periodic audits check that protection has kept up.",
      },
    ],
    relatedServices: ["fire-safety-training", "amc-maintenance", "fire-protection-systems"],
    industries: ["manufacturing", "chemical-fertilizer-plants", "pharmaceutical", "warehouses-logistics", "commercial-buildings"],
    equipmentCategories: [],
    primaryCta: "quote",
  },
  {
    slug: "fire-safety-training",
    title: "Fire & Safety Training",
    shortTitle: "Training",
    seoTitle: "On-Site Fire Safety Training in Visakhapatnam",
    seoDescription: "On-site fire safety awareness, extinguisher familiarisation and evacuation drill support for employees, fire wardens and safety teams.",
    icon: "graduationCap",
    summary: "Practical fire safety awareness and extinguisher-handling training that helps your people respond correctly and evacuate safely.",
    heroIntro:
      "Equipment only helps if people know how and when to use it. Our training builds practical awareness: how fires start, how to raise the alarm, when to use an extinguisher and when to leave.",
    overview: [
      "Most fire safety outcomes depend on the first few minutes: someone noticing, raising the alarm and making a sound decision about whether to tackle a small fire or evacuate.",
      "Safe Bharat delivers on-site fire safety training for employees, supervisors and safety teams. Sessions are adapted to your site and its hazards.",
    ],
    customerNeeds: [
      "Induction-level fire safety awareness for employees",
      "Hands-on extinguisher familiarisation",
      "Refresher training for fire wardens and safety teams",
      "Support for evacuation drills",
    ],
    scope: [
      "Fire safety awareness: causes of fire, prevention and good housekeeping",
      "Raising the alarm and evacuation procedures",
      "Types of fire extinguishers and when to use them",
      "Supervised practical extinguisher demonstration, where site conditions allow",
      "Support for planning and observing evacuation drills",
    ],
    deliverables: [
      "Session plan agreed before training",
      "Attendance record",
      "Observations from drills, where included",
    ],
    applications: ["New-joiner induction", "Annual refreshers", "Fire warden teams", "Contractor safety briefings"],
    process: [
      { title: "Needs discussion", description: "We discuss your site, your audience and what the session needs to achieve." },
      { title: "Session plan", description: "We share a plan covering topics, duration and any practical elements." },
      { title: "Delivery", description: "Training is delivered on your premises with practical demonstrations where safe and permitted." },
      { title: "Records", description: "You receive attendance records and any observations." },
    ],
    referenceStandards: [],
    faqs: [
      {
        question: "Do you provide practical extinguisher training?",
        answer: "Yes, where site conditions allow. Live demonstrations need a safe, open area and your site's permission. We plan this with your safety team.",
      },
      {
        question: "Do participants receive certificates?",
        answer: "Ask us about this when you enquire, and tell us whether you need certificates for internal records or for a particular requirement.",
      },
      {
        question: "Who should attend fire safety training?",
        answer: "Everyone on site benefits from knowing how to raise the alarm and evacuate. We train employees at induction, shift teams, supervisors, fire wardens and safety teams, and give contractor safety briefings.",
      },
      {
        question: "What does your fire safety training cover?",
        answer: "Causes of fire, prevention and good housekeeping; raising the alarm and evacuation; the types of fire extinguisher and when to use them; a supervised practical demonstration where site conditions allow; and support for evacuation drills.",
        links: [{ label: "Fire extinguishers", href: "/services/fire-extinguishers" }],
      },
    ],
    relatedServices: ["fire-safety-audits", "fire-extinguishers", "fire-crew"],
    industries: ["manufacturing", "chemical-fertilizer-plants", "pharmaceutical", "commercial-buildings", "warehouses-logistics"],
    equipmentCategories: [],
    primaryCta: "quote",
  },
  {
    slug: "fire-safety-equipment-supply",
    title: "Fire & Safety Equipment Supply",
    shortTitle: "Equipment Supply",
    seoTitle: "Fire & Safety Equipment Supplier in Visakhapatnam",
    seoDescription: "Fire extinguishers, fire alarm devices, hydrant and sprinkler components, safety signage and PPE, quoted item by item with optional installation.",
    icon: "package",
    summary: "Supply of fire extinguishers, alarm devices, hydrant and sprinkler components, signage and safety equipment for projects and replacements.",
    heroIntro:
      "One supplier for the fire and safety equipment your project or facility needs, selected to suit the application and backed by installation and servicing support.",
    overview: [
      "Buying fire safety equipment from several vendors makes it harder to keep it compatible, documented and maintained. We supply equipment as part of complete projects or as standalone orders.",
      "Our equipment range covers portable extinguishers, fire alarm devices, hydrant and hose components, sprinkler components, safety signage and personal protective equipment.",
    ],
    customerNeeds: [
      "Equipment for new projects or expansions",
      "Replacement of damaged or expired equipment",
      "Spares for existing systems",
      "Safety signage and PPE for sites",
    ],
    scope: [
      "Requirement review and equipment selection support",
      "Quotation with make and specification details for each item",
      "Supply and delivery coordination",
      "Optional installation and commissioning",
    ],
    deliverables: ["Itemised quotation", "Delivery with supporting documentation from the manufacturer, where provided", "Installation support if required"],
    applications: ["Project procurement", "Maintenance spares", "Replacement programmes", "New site set-up"],
    process: standardProcess,
    referenceStandards: [],
    faqs: [
      {
        question: "Which brands do you supply?",
        answer: "Makes and models depend on your requirement and specification. We confirm them in the quotation. If your project has an approved make list, share it with your enquiry.",
      },
      {
        question: "Do you publish prices?",
        answer: "No. Prices depend on specification, quantity and delivery location, so we quote for each requirement.",
      },
      {
        question: "What fire and safety equipment do you supply?",
        answer: "Portable fire extinguishers, fire alarm devices, hydrant and hose components, sprinkler components, safety signage and personal protective equipment. Fire pump sets are supplied as part of system projects.",
        links: [{ label: "Equipment catalogue", href: "/equipment" }],
      },
      {
        question: "Do you install the equipment you supply?",
        answer: "Installation and commissioning are available as an option with a supply order. Tell us when you enquire and we will include them in the quotation.",
        links: [{ label: "Installation & commissioning", href: "/services/installation-commissioning" }],
      },
    ],
    relatedServices: ["fire-extinguishers", "installation-commissioning", "fire-protection-systems"],
    industries: ["manufacturing", "warehouses-logistics", "commercial-buildings", "infrastructure-industrial"],
    equipmentCategories: ["fire-extinguishers", "fire-alarm-equipment", "hydrant-equipment", "sprinkler-equipment", "signage-ppe"],
    primaryCta: "quote",
  },
  {
    slug: "fire-crew",
    title: "Fire Crew",
    shortTitle: "Fire Crew",
    seoTitle: "Fire Watch & Fire Crew for Shutdowns and Hot Work",
    seoDescription: "Trained fire and safety personnel for fire watch during plant shutdowns, turnarounds, hot work and planned events, with duties agreed per deployment.",
    icon: "hardHat",
    summary: "Trained fire and safety personnel for site deployment, such as fire watch during shutdowns, hot work and other planned activities.",
    heroIntro:
      "Extra fire safety cover when your site needs it most. We provide fire crew for planned activities where the fire risk rises for a period.",
    overview: [
      "Shutdowns, maintenance turnarounds, hot work and large events can temporarily raise fire risk. Dedicated fire safety personnel give you trained eyes and a first response on site.",
      "Safe Bharat provides fire crew for deployment at customer sites. Manpower, duration, duties and reporting are agreed for each engagement.",
    ],
    customerNeeds: [
      "Fire watch during hot work, shutdowns or turnarounds",
      "Temporary fire safety cover for projects",
      "Additional safety personnel for planned events",
    ],
    scope: [
      "Deployment of fire and safety personnel as agreed",
      "Fire watch and first-response readiness during the agreed activity",
      "Coordination with your site safety team and procedures",
    ],
    deliverables: ["Agreed deployment plan", "Attendance and activity records as agreed"],
    applications: ["Plant shutdowns and turnarounds", "Hot work permits", "Construction and project sites", "Planned events"],
    process: [
      { title: "Requirement", description: "Tell us the activity, location, duration and the number of personnel needed." },
      { title: "Proposal", description: "We confirm availability, duties and terms in writing." },
      { title: "Deployment", description: "Personnel report to your site safety team and follow your procedures." },
    ],
    referenceStandards: [],
    contractNote: "Manpower numbers, qualifications, shift patterns and duties are agreed in writing for each deployment.",
    faqs: [
      {
        question: "How much notice do you need?",
        answer: "Contact us as early as possible with the activity dates. We will confirm availability for your schedule.",
      },
      {
        question: "When do sites use a fire watch?",
        answer: "Fire watch is commonly arranged for activities that raise fire risk for a period, such as plant shutdowns, maintenance turnarounds, hot work and large planned events. Your permit-to-work system and site rules decide when it is required.",
      },
      {
        question: "What does a fire crew do on site?",
        answer: "Fire crew keep a fire watch and stay ready for first response during the agreed activity. They report to your site safety team and follow your procedures. Manpower, duties and reporting are agreed in writing for each deployment.",
      },
    ],
    relatedServices: ["fire-safety-training", "fire-safety-audits", "amc-maintenance"],
    industries: ["chemical-fertilizer-plants", "manufacturing", "infrastructure-industrial"],
    equipmentCategories: [],
    primaryCta: "quote",
  },
];

/** The seven primary service lines featured in navigation and on the homepage. */
export const featuredServiceSlugs = [
  "fire-extinguishers",
  "fire-protection-systems",
  "fire-alarm-systems",
  "installation-commissioning",
  "amc-maintenance",
  "fire-safety-audits",
] as const;

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getServices(slugs: readonly string[]): Service[] {
  return slugs.map((slug) => getService(slug)).filter((s): s is Service => Boolean(s));
}

export const serviceOptions = services.map((s) => ({ value: s.slug, label: s.title }));
