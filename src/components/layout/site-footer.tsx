import { Fragment } from "react";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { Mail, MapPin, Phone } from "lucide-react";
import { footerNav } from "@/config/navigation";
import { mapsUrl, siteConfig } from "@/config/site";
import { services } from "@/content/services";
import { Container } from "@/components/ui/primitives";

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

/** Text made of phrases that should never break internally. */
function Phrases({ parts }: { parts: string[] }) {
  return parts.map((part, i) => (
    <Fragment key={part}>
      {i > 0 ? " " : null}
      <span className="whitespace-nowrap">{part}</span>
    </Fragment>
  ));
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="font-heading text-xs font-bold tracking-[0.16em] text-white/90 uppercase">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-white/65 transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The floating chat launcher and contact shortcut sit at the bottom right of
 * the viewport, and on mobile the quick-contact bar covers the bottom edge.
 * The footer keeps that corner clear: extra bottom padding on mobile, and no
 * bottom-bar content in the right-hand 14rem from `md` up.
 */
export function SiteFooter() {
  const a = siteConfig.contact.address;
  return (
    <footer className="bg-navy-950 pb-[calc(8.5rem+env(safe-area-inset-bottom))] text-white md:pb-0">
      <div aria-hidden="true" className="h-1 bg-brand-red" />
      <Container className="grid gap-10 py-12 sm:py-14 lg:grid-cols-12 lg:gap-8 lg:py-16">
        <div className="lg:col-span-3">
          <p className="font-heading text-xl leading-tight font-extrabold text-white">
            {siteConfig.shortName}{" "}
            <span className="mt-1 block text-[11px] font-bold tracking-[0.18em] text-white/55 uppercase">Fire and Safety Solutions</span>
          </p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-pretty text-white/65">{siteConfig.description}</p>
          {/* Each phrase stays whole; lines break only at the spaces between phrases. */}
          <p className="mt-5 text-sm font-semibold text-white">
            <Phrases parts={siteConfig.tagline.split(/(?<=\.)\s+/)} />
          </p>
          <p className="mt-1.5 text-[11px] tracking-wider text-white/55 uppercase">
            <Phrases parts={siteConfig.values.map((v, i) => (i < siteConfig.values.length - 1 ? `${v} ·` : v))} />
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-6">
          <FooterColumn title="Services" links={services.map((s) => ({ label: s.shortTitle, href: `/services/${s.slug}` }))} />
          <FooterColumn title="Company" links={footerNav.company} />
          <FooterColumn title="Enquiries" links={footerNav.enquiries} />
        </nav>

        <div className="lg:col-span-3">
          <h2 className="font-heading text-xs font-bold tracking-[0.16em] text-white/90 uppercase">Contact</h2>
          <ul className="mt-4 space-y-3.5 text-sm text-white/70">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden="true" />
              <a href={mapsUrl()} target="_blank" rel="noopener noreferrer" className="leading-relaxed hover:text-white">
                {a.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <span className="block">
                  {a.locality}, <span className="whitespace-nowrap">{a.region} {a.postalCode}</span>
                </span>
                <span className="sr-only"> (opens Google Maps in a new tab)</span>
              </a>
            </li>
            {siteConfig.contact.phones.map((p) => (
              <li key={p.tel} className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden="true" />
                <a href={`tel:${p.tel}`} className="whitespace-nowrap hover:text-white">
                  {p.display}
                </a>
              </li>
            ))}
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden="true" />
              <a href={`mailto:${siteConfig.contact.email}`} className="min-w-0 wrap-anywhere hover:text-white">
                {siteConfig.contact.email}
              </a>
            </li>
          </ul>
          <p className="mt-5 text-xs tracking-wide text-white/55">GSTIN {siteConfig.gstNumber}</p>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="py-6">
          <div className="flex flex-col gap-3 text-xs leading-relaxed text-white/55 md:pr-56">
            <p className="text-white/75">
              This website and its AI assistant are not an emergency service. In a fire emergency, call{" "}
              <a href="tel:112" className="font-semibold text-white underline underline-offset-2">
                112
              </a>
              .
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
              <p>
                © <CopyrightYear /> {siteConfig.name}. All rights reserved.
              </p>
              <ul className="flex flex-wrap gap-x-5 gap-y-1">
                {footerNav.legal.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
