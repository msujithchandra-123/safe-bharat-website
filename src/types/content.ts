import type { IconName } from "@/components/ui/icon";

export interface FAQ {
  question: string;
  answer: string;
  /** Pages on this site where the answer is covered in more detail. */
  links?: { label: string; href: string }[];
}

export interface ProcessStep {
  title: string;
  description: string;
}

/** Reference standard shown as general guidance — never as a claim of certification. */
export interface ReferenceStandard {
  code: string;
  title: string;
  /** Official source for a status statement made in the title (e.g. a withdrawal). */
  source?: { label: string; href: string };
}

export type ServiceCTA = "quote" | "amc";

export interface Service {
  slug: string;
  title: string;
  shortTitle: string;
  /** Search result title (without the brand suffix) and meta description. */
  seoTitle: string;
  seoDescription: string;
  icon: IconName;
  summary: string;
  heroIntro: string;
  overview: string[];
  customerNeeds: string[];
  scope: string[];
  deliverables: string[];
  applications: string[];
  process: ProcessStep[];
  referenceStandards: ReferenceStandard[];
  faqs: FAQ[];
  relatedServices: string[];
  industries: string[];
  equipmentCategories: string[];
  primaryCta: ServiceCTA;
  /** Short note for details that are agreed per contract rather than published. */
  contractNote?: string;
}

export interface Industry {
  slug: string;
  title: string;
  /** Search result title (without the brand suffix) and meta description. */
  seoTitle: string;
  seoDescription: string;
  icon: IconName;
  summary: string;
  intro: string;
  typicalNeeds: string[];
  howWeHelp: string[];
  relevantServices: string[];
  faqs: FAQ[];
}

export interface EquipmentCategory {
  slug: string;
  title: string;
  icon: IconName;
  summary: string;
}

export interface EquipmentItem {
  slug: string;
  name: string;
  category: string;
  icon: IconName;
  summary: string;
  description: string[];
  applications: string[];
  /** Verified specifications only. Empty until manufacturer data is approved. */
  specifications: { label: string; value: string }[];
  manufacturer: string | null;
  datasheetUrl: string | null;
  relatedServices: string[];
}

export interface Project {
  slug: string;
  title: string;
  client: string | null;
  industry: string;
  category: string;
  location: string;
  completedOn: string;
  summary: string;
  scope: string[];
  challenge: string;
  execution: string[];
  /** Outcomes verified with the client. */
  outcomes: string[];
  services: string[];
  images: { src: string; alt: string; width: number; height: number }[];
  approvedForPublication: true;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  approvedForPublication: true;
}

export type ResourceBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; tone: "info" | "warning"; text: string };

export interface ResourceSection {
  heading: string;
  blocks: ResourceBlock[];
}

export interface Resource {
  slug: string;
  title: string;
  category: "Guide" | "Checklist" | "FAQ" | "Planning";
  summary: string;
  readingMinutes: number;
  sections: ResourceSection[];
  faqs?: FAQ[];
  relatedServices: string[];
  /**
   * Technical safety content must be reviewed before it is indexed.
   * Pending articles are published with a review notice, excluded from the
   * sitemap and marked noindex until a qualified reviewer approves them.
   */
  review: { status: "pending" } | { status: "approved"; reviewedBy: string; reviewedOn: string };
}
