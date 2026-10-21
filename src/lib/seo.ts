import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";
import type { Service } from "@/types/content";

/**
 * Hosts that can never be the real production domain: reserved and local-only
 * names (RFC 2606 / RFC 6761 and common LAN suffixes), any `example.*`
 * domain such as the documentation placeholder `www.example.in`, and raw IP
 * addresses.
 */
const NON_PRODUCTION_HOST = /(^|\.)(localhost|local|invalid|test|example|internal|lan|home\.arpa)$|(^|\.)example\.[a-z.]+$/;
const IP_HOST = /^\d{1,3}(\.\d{1,3}){3}$|^\[[0-9a-f:.]+\]$/;

/**
 * Search engines may index the site only when it runs on its real public
 * address: an https NEXT_PUBLIC_SITE_URL whose host is a real domain (not
 * localhost, a placeholder, a reserved test name or an IP address) and, on
 * Vercel, only the production deployment. Anywhere else (local builds, E2E,
 * preview deployments, or a deployment where the URL was never configured)
 * every page is noindex and robots.txt disallows crawling, so canonical URLs
 * pointing at the wrong host can never be indexed.
 */
export function searchIndexingAllowed(url: string = siteConfig.url, vercelEnv: string | undefined = process.env.VERCEL_ENV): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  const host = parsed.hostname.toLowerCase();
  const realDomain = host.includes(".") && !NON_PRODUCTION_HOST.test(host) && !IP_HOST.test(host);
  return parsed.protocol === "https:" && realDomain && (vercelEnv === undefined || vercelEnv === "production");
}

/** The site-wide social sharing image (src/app/opengraph-image.png, 1200 × 630). */
export const DEFAULT_SOCIAL_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: `${siteConfig.name}: fire protection equipment, systems and maintenance in Visakhapatnam`,
};

/** Unique title, description, canonical URL and social metadata for a route. */
export function buildMetadata({
  title,
  description,
  path,
  noindex = false,
}: {
  /** A plain string is completed by the root title template ("… | Safe Bharat"). */
  title: string | { absolute: string };
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const socialTitle = typeof title === "string" ? `${title} | ${siteConfig.shortName}` : title.absolute;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: [DEFAULT_SOCIAL_IMAGE],
    },
    twitter: { card: "summary_large_image", title: socialTitle, description, images: [DEFAULT_SOCIAL_IMAGE.url] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

const ORGANIZATION_ID = `${siteConfig.url}/#organization`;

/**
 * Only the verified base city. Wider coverage (all of Andhra Pradesh or other
 * states) is an open owner decision (docs/CONTENT_REVIEW.md, item 9); add it
 * here only once it is confirmed.
 */
const areaServed = [{ "@type": "City", name: siteConfig.contact.address.locality }];

export function organizationJsonLd(): Record<string, unknown> {
  const a = siteConfig.contact.address;
  return {
    "@type": "LocalBusiness",
    "@id": ORGANIZATION_ID,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    slogan: siteConfig.tagline,
    url: siteConfig.url,
    logo: absoluteUrl("/brand/safe-bharat-logo-full.png"),
    image: absoluteUrl(DEFAULT_SOCIAL_IMAGE.url),
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phones.map((p) => p.tel),
    taxID: siteConfig.gstNumber,
    areaServed,
    address: {
      "@type": "PostalAddress",
      streetAddress: a.lines.join(", "),
      addressLocality: a.locality,
      addressRegion: a.region,
      postalCode: a.postalCode,
      addressCountry: a.country,
    },
  };
}

/** Home page: the business and the website, as one graph. */
export function homeJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        name: siteConfig.name,
        alternateName: siteConfig.shortName,
        url: siteConfig.url,
        inLanguage: "en-IN",
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}

/**
 * Service pages. The provider is named in full (not only by @id) because the
 * organisation node is published on the home page, not on every page.
 * No prices, ratings or reviews: none are published on the site.
 */
export function serviceJsonLd(service: Pick<Service, "slug" | "title" | "seoDescription">): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    serviceType: service.title,
    description: service.seoDescription,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: { "@type": "LocalBusiness", "@id": ORGANIZATION_ID, name: siteConfig.name, url: siteConfig.url },
    areaServed,
  };
}
