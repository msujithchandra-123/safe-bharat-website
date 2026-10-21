import { NextResponse, type NextRequest } from "next/server";
import { equipment } from "@/content/equipment";
import { industries } from "@/content/industries";
import { projects } from "@/content/projects";
import { resources } from "@/content/resources";
import { services } from "@/content/services";

/**
 * Rejects unknown slugs on the dynamic content routes before rendering starts.
 * With Partial Prerendering the page shell streams immediately, so a
 * `notFound()` inside the page could only produce a "soft 404" (status 200 +
 * noindex). Rewriting here lets Next.js answer with a real 404 status.
 */
const KNOWN: Record<string, Set<string>> = {
  services: new Set(services.map((s) => s.slug)),
  industries: new Set(industries.map((i) => i.slug)),
  equipment: new Set(equipment.map((e) => e.slug)),
  resources: new Set(resources.map((r) => r.slug)),
  projects: new Set(projects.map((p) => p.slug)),
};

export function proxy(request: NextRequest) {
  const [, section, slug, ...rest] = request.nextUrl.pathname.split("/");
  const known = section ? KNOWN[section] : undefined;
  if (!known || !slug) return NextResponse.next();
  if (rest.length === 0 && known.has(decodeURIComponent(slug))) return NextResponse.next();
  // No route exists at this path, so Next.js renders the branded not-found page with a 404 status.
  return NextResponse.rewrite(new URL("/_sb-not-found", request.url));
}

export const config = {
  matcher: ["/services/:path+", "/industries/:path+", "/equipment/:path+", "/resources/:path+", "/projects/:path+"],
};
