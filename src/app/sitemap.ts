import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { equipment } from "@/content/equipment";
import { industries } from "@/content/industries";
import { projects } from "@/content/projects";
import { isIndexable, resources } from "@/content/resources";
import { services } from "@/content/services";

const STATIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/industries",
  "/equipment",
  "/resources",
  "/contact",
  "/request-a-quote",
  "/request-an-amc",
  "/privacy-policy",
  "/terms",
  "/image-credits",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: absoluteUrl(path), priority });
  return [
    ...STATIC_ROUTES.map((p) => entry(p, p === "/" ? 1 : 0.7)),
    // The projects index has no content until an approved case study exists, so it stays out until then.
    ...(projects.length > 0 ? [entry("/projects", 0.7)] : []),
    ...services.map((s) => entry(`/services/${s.slug}`, 0.9)),
    ...industries.map((i) => entry(`/industries/${i.slug}`, 0.7)),
    ...equipment.map((e) => entry(`/equipment/${e.slug}`, 0.5)),
    ...projects.map((p) => entry(`/projects/${p.slug}`, 0.6)),
    // Guidance pending technical review is excluded until approved.
    ...resources.filter(isIndexable).map((r) => entry(`/resources/${r.slug}`, 0.5)),
  ];
}
