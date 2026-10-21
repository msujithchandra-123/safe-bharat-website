import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { searchIndexingAllowed } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Local, preview and unconfigured deployments must never be crawled.
  if (!searchIndexingAllowed()) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
