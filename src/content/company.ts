import type { IconName } from "@/components/ui/icon";
import type { FAQ, ProcessStep } from "@/types/content";

/**
 * Company narrative. Mission and vision are draft wording based on the brand
 * values and requirements document, pending Safe Bharat approval
 * (docs/CONTENT_REVIEW.md). Leadership, team size, years of experience,
 * certifications and client names are deliberately omitted until supplied.
 */
export const company = {
  overview: [
    "Safe Bharat Fire and Safety Solutions is a fire protection and safety services company based in Visakhapatnam, Andhra Pradesh.",
    "We help industrial and commercial customers protect their people, property and operations. We supply fire safety equipment, install and commission fire protection and alarm systems, maintain them through planned servicing and Annual Maintenance Contracts, and train the people who depend on them.",
    "Our approach is simple. We understand the site, recommend what it actually needs, do the work properly, and document it clearly.",
  ],
  mission:
    "To protect people, property and operations by delivering dependable fire protection systems, equipment, maintenance and training, done properly and supported over the long term.",
  vision:
    "To be a trusted fire and safety partner for industry and enterprise across Bharat, known for engineering discipline, honest advice and service that lasts beyond installation.",
  brandMessage: "Protecting People. Protecting Property. Protecting Operations.",
  safetyPhilosophy: [
    "Safety is more than equipment. It is a system. Detection, alarm, suppression, maintenance and trained people all have to work together.",
    "We would rather give accurate advice than tell customers what they want to hear. If a requirement is outside our scope, we say so.",
    "Protection does not stop after installation. Systems are only dependable if they are tested, maintained and understood by the people on site.",
  ],
};

export const brandValues: { title: string; description: string; icon: IconName }[] = [
  { title: "Safe People", description: "Early warning, accessible equipment and trained people give everyone on site the best chance to stay safe.", icon: "users" },
  { title: "Safe Property", description: "Well-chosen, well-maintained protection limits damage to facilities, assets and stock.", icon: "shieldCheck" },
  { title: "Stronger Bharat", description: "Safer workplaces support the industries and communities that build the nation.", icon: "flame" },
];

export const whyChooseUs: { title: string; description: string; icon: IconName }[] = [
  { title: "Engineering-led approach", description: "Recommendations start from a site survey and the actual hazards, not a standard product list.", icon: "workflow" },
  { title: "End-to-end capability", description: "Equipment supply, installation, commissioning, maintenance and training from one accountable team.", icon: "layers" },
  { title: "Quality-focused execution", description: "Careful installation, testing before handover and clear documentation of what was done.", icon: "badgeCheck" },
  { title: "Reliable service", description: "Planned maintenance and AMCs that keep systems ready, with reports you can file and act on.", icon: "calendarCheck" },
  { title: "Safety-first team", description: "Work planned around your permit-to-work and site safety rules from the first visit.", icon: "hardHat" },
];

/** Lifecycle shown in the capability strip. */
export const lifecycle = ["Survey", "Design", "Supply", "Installation", "Testing", "Maintenance", "Training"] as const;

export const howWeWork: ProcessStep[] = [
  { title: "Understand", description: "A site survey and conversation with your team to understand the premises, hazards and existing protection." },
  { title: "Recommend", description: "A clear written proposal covering what is needed, why it is needed and what it involves." },
  { title: "Deliver", description: "Supply, installation or servicing carried out safely, tested and documented." },
  { title: "Sustain", description: "Planned maintenance, AMC support and training that keep protection effective." },
];

/** Trust indicators that can be verified from the company's own documents. */
export const trustIndicators: { label: string; detail: string; icon: IconName }[] = [
  { label: "GST-registered business", detail: "GSTIN 37CXQPC2666B1ZH", icon: "badgeCheck" },
  { label: "Based in Visakhapatnam", detail: "PM Palem, Andhra Pradesh", icon: "building" },
  { label: "Supply to maintenance", detail: "One team across the system lifecycle", icon: "layers" },
  { label: "Training & audits", detail: "Preparedness as well as equipment", icon: "graduationCap" },
];

export const generalFaqs: FAQ[] = [
  {
    question: "What does Safe Bharat do?",
    answer: "We supply fire safety equipment; install and commission fire alarm, hydrant, hose reel and sprinkler systems; service and maintain them, including through Annual Maintenance Contracts; and provide fire safety audits, training and fire crew.",
  },
  {
    question: "Where are you located, and which sites can you serve?",
    answer: "We are based in PM Palem, Visakhapatnam, Andhra Pradesh. Tell us your site location when you enquire and we will confirm whether we can serve it.",
  },
  {
    question: "How do I get a quotation?",
    answer: "Use the Request a Quote form, call or email us. Quotations depend on the site and scope, so we may ask for drawings, quantities or a site visit before quoting.",
  },
  {
    question: "Do you offer Annual Maintenance Contracts?",
    answer: "Yes. AMCs can cover extinguishers, fire alarm systems, hydrant and hose reel systems and sprinkler systems. Coverage, visit frequency and terms are agreed in writing for each contract.",
  },
  {
    question: "Do you publish prices?",
    answer: "No. Prices depend on the equipment specification, quantities, site conditions and scope of work, so every requirement is quoted individually.",
  },
  {
    question: "What should I do in a fire emergency?",
    answer: "Follow your site's emergency procedure, raise the alarm, evacuate if it is unsafe to stay, and call the emergency services on 112. This website and its assistant are not an emergency service.",
  },
];
