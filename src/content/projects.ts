import type { Project } from "@/types/content";

/**
 * Only real, completed projects whose details (and client name, if shown)
 * have been approved for publication belong here. Tenders, proposals and
 * ongoing bids must not be listed. The list is intentionally empty until
 * Safe Bharat supplies approved case studies — the Projects page shows an
 * honest "portfolio in preparation" state in the meantime.
 */
export const projects: Project[] = [];

export const projectCategories = ["Fire Alarm Systems", "Fire Protection Systems", "Fire Extinguishers", "AMC & Maintenance"] as const;

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
