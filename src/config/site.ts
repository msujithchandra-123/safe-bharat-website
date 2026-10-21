/**
 * Approved business facts for Safe Bharat Fire and Safety Solutions.
 *
 * Source: the official Safe Bharat banner (contact block) and the Frontend
 * Website Requirements v1.0 (August 2026). Anything not present in those
 * sources is intentionally absent — see docs/CONTENT_REVIEW.md before adding
 * registrations, certifications, statistics or client names.
 */

export const siteConfig = {
  name: "Safe Bharat Fire and Safety Solutions",
  shortName: "Safe Bharat",
  tagline: "Committed to Safety. Dedicated to Protection.",
  positioning: "Integrated fire protection and safety solutions",
  description:
    "Safe Bharat Fire and Safety Solutions supplies, installs, services and maintains fire protection systems and equipment for industrial and commercial facilities in Visakhapatnam and Andhra Pradesh.",
  values: ["Safe People", "Safe Property", "Stronger Bharat"] as const,
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_IN",
  contact: {
    phones: [
      { display: "+91 85220 21566", tel: "+918522021566" },
      { display: "+91 73861 92174", tel: "+917386192174" },
    ],
    email: "safebharatsales@gmail.com",
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || null,
    address: {
      lines: ["Flat No. 307, Door No. 13-49/27", "M K Prestige, Near Sivalayam", "PM Palem"],
      locality: "Visakhapatnam",
      region: "Andhra Pradesh",
      postalCode: "530041",
      country: "IN",
    },
  },
  gstNumber: "37CXQPC2666B1ZH",
  serviceArea: "Visakhapatnam and Andhra Pradesh",
  emergencyNumber: "112",
  privacyNoticeVersion: "2026-10",
} as const;

export function formatAddress(separator = ", "): string {
  const a = siteConfig.contact.address;
  return [...a.lines, `${a.locality}, ${a.region} ${a.postalCode}`].join(separator);
}

export function mapsUrl(): string {
  const a = siteConfig.contact.address;
  const query = `M K Prestige, Near Sivalayam, PM Palem, ${a.locality}, ${a.region} ${a.postalCode}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function whatsappUrl(message?: string): string | null {
  const n = siteConfig.contact.whatsappNumber;
  if (!n) return null;
  return `https://wa.me/${n}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function absoluteUrl(path = "/"): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
