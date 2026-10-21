import { render } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { FAQAccordion } from "@/components/sections/sections";
import { equipment } from "@/content/equipment";
import { industries } from "@/content/industries";
import { projects } from "@/content/projects";
import { resources } from "@/content/resources";
import { services } from "@/content/services";
import { buildMetadata, homeJsonLd, searchIndexingAllowed, serviceJsonLd } from "@/lib/seo";

const BRAND_SUFFIX = " | Safe Bharat";

// A stand-in for the real domain, which is not confirmed yet. Never fetched.
const PRODUCTION_URL = "https://www.configured-production-domain.in";

describe("search indexing guard", () => {
  it("allows indexing only on an https URL with a real domain", () => {
    expect(searchIndexingAllowed(PRODUCTION_URL, undefined)).toBe(true);
    for (const url of [
      "http://localhost:3000",
      "https://localhost:3000",
      "http://www.configured-production-domain.in",
      "https://www.example.in",
      "https://example.com",
      "https://shop.example.co.in",
      "https://www.safebharat-seo-check.invalid",
      "https://site.test",
      "https://intranet.local",
      "https://203.0.113.10",
      "https://[2001:db8::1]",
      "https://intranet",
      "not a url",
    ])
      expect(searchIndexingAllowed(url, undefined), url).toBe(false);
  });

  it("allows indexing on Vercel only for the production deployment", () => {
    expect(searchIndexingAllowed(PRODUCTION_URL, "production")).toBe(true);
    expect(searchIndexingAllowed(PRODUCTION_URL, "preview")).toBe(false);
    expect(searchIndexingAllowed(PRODUCTION_URL, "development")).toBe(false);
  });

  it("blocks all crawling in robots.txt when the site is not on its production URL (as in tests)", () => {
    expect(robots()).toEqual({ rules: [{ userAgent: "*", disallow: "/" }] });
  });
});

describe("on a configured production domain", () => {
  const saved = { url: process.env.NEXT_PUBLIC_SITE_URL, vercel: process.env.VERCEL_ENV };
  beforeAll(() => {
    process.env.NEXT_PUBLIC_SITE_URL = PRODUCTION_URL;
    delete process.env.VERCEL_ENV;
    vi.resetModules();
  });
  afterAll(() => {
    if (saved.url === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = saved.url;
    if (saved.vercel !== undefined) process.env.VERCEL_ENV = saved.vercel;
    vi.resetModules();
  });

  /** Every absolute URL in a value, ignoring schema.org vocabulary and official external sources. */
  const urlsIn = (value: unknown) =>
    [...JSON.stringify(value).matchAll(/https?:\/\/[^"\s]+/g)].map((m) => m[0]).filter((u) => !u.startsWith("https://schema.org"));

  it("allows crawling, lists the sitemap and keeps API routes blocked", async () => {
    const { default: prodRobots } = await import("@/app/robots");
    expect(prodRobots()).toEqual({ rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }], sitemap: `${PRODUCTION_URL}/sitemap.xml` });
  });

  it("uses the configured domain for sitemap, canonical, Open Graph and JSON-LD URLs", async () => {
    const { default: prodSitemap } = await import("@/app/sitemap");
    const seo = await import("@/lib/seo");
    const { services: prodServices } = await import("@/content/services");
    const meta = seo.buildMetadata({ title: "T", description: "D", path: "/services" });
    const urls = [
      ...prodSitemap().map((e) => e.url),
      ...urlsIn(meta.alternates),
      ...urlsIn(meta.openGraph),
      ...urlsIn(seo.homeJsonLd()),
      ...prodServices.flatMap((s) => urlsIn(seo.serviceJsonLd(s))),
    ];
    expect(urls.length).toBeGreaterThan(40);
    for (const u of urls) expect(new URL(u).origin, u).toBe(PRODUCTION_URL);
    expect(seo.searchIndexingAllowed()).toBe(true);
  });
});

describe("page metadata", () => {
  it("sets a canonical URL, Open Graph and Twitter image on every page built with buildMetadata", () => {
    const m = buildMetadata({ title: "Example", description: "Example description", path: "/example" });
    expect(m.alternates?.canonical).toMatch(/\/example$/);
    expect(m.openGraph).toMatchObject({ url: expect.stringMatching(/\/example$/), title: "Example | Safe Bharat" });
    expect((m.openGraph as { images: unknown[] }).images).toHaveLength(1);
    expect(m.twitter).toMatchObject({ card: "summary_large_image", images: ["/opengraph-image.png"] });
    expect(m.robots).toBeUndefined();
  });

  it("keeps an absolute title as given", () => {
    const m = buildMetadata({ title: { absolute: "Home title" }, description: "d", path: "/" });
    expect(m.title).toEqual({ absolute: "Home title" });
    expect(m.openGraph?.title).toBe("Home title");
  });

  it("gives every service and industry a unique search title and description of a displayable length", () => {
    const pages = [...services, ...industries];
    for (const p of pages) {
      expect((p.seoTitle + BRAND_SUFFIX).length, p.slug).toBeLessThanOrEqual(65);
      expect(p.seoDescription.length, p.slug).toBeGreaterThanOrEqual(110);
      expect(p.seoDescription.length, p.slug).toBeLessThanOrEqual(160);
    }
    expect(new Set(pages.map((p) => p.seoTitle)).size).toBe(pages.length);
    expect(new Set(pages.map((p) => p.seoDescription)).size).toBe(pages.length);
  });
});

describe("structured data", () => {
  it("describes the business and website on the home page without ratings or reviews", () => {
    const graph = (homeJsonLd()["@graph"] as Record<string, unknown>[]).map((n) => n["@type"]);
    expect(graph).toEqual(["LocalBusiness", "WebSite"]);
    expect(JSON.stringify(homeJsonLd())).not.toMatch(/aggregateRating|review|offers/i);
  });

  it("names only the verified base city as the service area until wider coverage is confirmed", () => {
    const graph = homeJsonLd()["@graph"] as Record<string, unknown>[];
    for (const data of [graph[0], ...services.map((s) => serviceJsonLd(s))]) {
      expect(data.areaServed).toEqual([{ "@type": "City", name: "Visakhapatnam" }]);
    }
  });

  it("names the provider on service pages and publishes no prices or ratings", () => {
    for (const s of services) {
      const data = serviceJsonLd(s);
      expect(data).toMatchObject({ "@type": "Service", name: s.title, provider: { name: "Safe Bharat Fire and Safety Solutions" } });
      expect(JSON.stringify(data)).not.toMatch(/aggregateRating|review|offers|price/i);
    }
  });

  it("renders visible FAQs without FAQPage markup", () => {
    const { container } = render(
      <FAQAccordion faqs={[{ question: "Q?", answer: "A.", links: [{ label: "AMC", href: "/services/amc-maintenance" }] }]} />,
    );
    expect(container.querySelector('script[type="application/ld+json"]')).toBeNull();
    expect(container.querySelector('a[href="/services/amc-maintenance"]')).toHaveTextContent("AMC");
  });
});

describe("internal links in FAQ answers", () => {
  const known = new Set([
    "/equipment",
    ...services.map((s) => `/services/${s.slug}`),
    ...equipment.map((e) => `/equipment/${e.slug}`),
    ...industries.map((i) => `/industries/${i.slug}`),
  ]);

  it("point only to pages that exist", () => {
    const links = [...services, ...industries].flatMap((p) => p.faqs.flatMap((f) => f.links ?? []));
    expect(links.length).toBeGreaterThan(0);
    for (const l of links) expect(known, l.href).toContain(l.href);
  });
});

describe("sitemap", () => {
  const paths = sitemap().map((e) => new URL(e.url).pathname);

  it("lists every service, industry and equipment page once", () => {
    for (const s of services) expect(paths).toContain(`/services/${s.slug}`);
    for (const i of industries) expect(paths).toContain(`/industries/${i.slug}`);
    for (const e of equipment) expect(paths).toContain(`/equipment/${e.slug}`);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("leaves out API routes, pending resources and the empty projects page", () => {
    expect(paths.some((p) => p.startsWith("/api"))).toBe(false);
    for (const r of resources.filter((r) => r.review.status !== "approved")) expect(paths).not.toContain(`/resources/${r.slug}`);
    if (projects.length === 0) expect(paths).not.toContain("/projects");
  });
});

describe("reference standards", () => {
  const all = services.flatMap((s) => s.referenceStandards.map((r) => ({ service: s.slug, ...r })));

  it("does not list the withdrawn National Building Code of India 2016 as a current reference", () => {
    for (const r of all) expect(r.code, r.service).not.toMatch(/NBC\s*2016|SP\s*7\s*:\s*2016/i);
  });

  it("cites an official source for every statement about a standard's status", () => {
    for (const r of all.filter((r) => /withdr|establish|replac|supersed/i.test(r.title))) {
      expect(r.source?.href, r.code).toMatch(/^https:\/\/(egazette\.gov\.in|www\.bis\.gov\.in|standards\.bis\.gov\.in)\//);
    }
    expect(all.some((r) => r.code === "SP 7:2026" && r.source)).toBe(true);
  });

  it("never presents a standard as a certification or compliance claim", () => {
    for (const r of all) expect(`${r.code} ${r.title}`, r.code).not.toMatch(/certif|complian|approved/i);
  });
});
