import type { ReactNode } from "react";
import { Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { trustIndicators } from "@/content/company";
import { getServices } from "@/content/services";
import type { FAQ, ProcessStep } from "@/types/content";
import { Breadcrumbs, type Crumb } from "@/components/layout/breadcrumbs";
import { ServiceGrid } from "@/components/cards/cards";
import type { SiteImage as SiteImageData } from "@/content/images";
import { Icon, type IconName } from "@/components/ui/icon";
import { SiteImage } from "@/components/ui/site-image";
import { ButtonLink, Container, Eyebrow, Section, SectionHeading, cn } from "@/components/ui/primitives";
import Link from "next/link";

/** Hero used by every inner page. */
export function PageHero({
  title,
  intro,
  eyebrow,
  breadcrumbs,
  icon,
  actions,
  children,
  image,
}: {
  image?: SiteImageData | null;
  title: string;
  intro?: ReactNode;
  eyebrow?: string;
  breadcrumbs: Crumb[];
  icon?: IconName;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="bg-blueprint relative isolate overflow-hidden bg-navy-900 text-white">
      {image ? (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          {/* Above-the-fold background: loaded eagerly; decorative because the heading carries the meaning. */}
          <SiteImage image={image} sizes="100vw" priority decorative />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/88 to-navy-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
        </div>
      ) : (
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-40 size-[28rem] rounded-full bg-navy-700/40 blur-3xl" />
      )}
      <Container className="relative py-14 sm:py-16 lg:py-20">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? (
              <Eyebrow tone="light" className="mb-4">
                {eyebrow}
              </Eyebrow>
            ) : null}
            <div className="flex items-start gap-4">
              {icon ? (
                <span className="mt-1 hidden size-14 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 sm:grid">
                  <Icon name={icon} className="size-7 text-white" strokeWidth={1.6} />
                </span>
              ) : null}
              <h1 className="text-4xl font-extrabold text-white sm:text-5xl">{title}</h1>
            </div>
            {intro ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">{intro}</p> : null}
            {children}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
        </div>
      </Container>
      <div aria-hidden="true" className="h-1 bg-gradient-to-r from-brand-red via-brand-red to-transparent" />
    </section>
  );
}

/**
 * Shown while a dynamic page reads its URL params. With Partial Prefetching this
 * is the route's shared App Shell: prerendered slugs are served complete, so
 * visitors normally only see it for an instant on an unlisted path.
 */
export function PageHeroFallback({ label }: { label: string }) {
  return (
    <section aria-busy="true" className="bg-blueprint relative overflow-hidden bg-navy-900 text-white">
      <Container className="relative py-14 sm:py-16 lg:py-20">
        <p role="status" className="sr-only">
          Loading {label}…
        </p>
        <div aria-hidden="true" className="animate-pulse space-y-6">
          <div className="h-4 w-48 rounded bg-white/15" />
          <div className="h-3 w-24 rounded bg-brand-red/60" />
          <div className="h-12 w-full max-w-xl rounded bg-white/20" />
          <div className="space-y-3">
            <div className="h-4 w-full max-w-2xl rounded bg-white/10" />
            <div className="h-4 w-4/5 max-w-xl rounded bg-white/10" />
          </div>
        </div>
      </Container>
      <div aria-hidden="true" className="h-1 bg-gradient-to-r from-brand-red via-brand-red to-transparent" />
    </section>
  );
}

export function TrustStrip() {
  return (
    <div className="border-b border-line bg-white">
      <Container>
        <ul className="grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {trustIndicators.map((t) => (
            <li key={t.label} className="flex items-center gap-3 py-5 lg:px-6 lg:first:pl-0">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy-900">
                <Icon name={t.icon} className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-bold text-navy-900">{t.label}</span>
                <span className="block text-xs text-muted">{t.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

export function CTASection({
  title = "Let's build a safer environment.",
  description = "Tell us about your site and requirement. We will review it and come back with the next step, whether that is a site survey, a proposal or advice.",
  primary = { label: "Request a Quote", href: "/request-a-quote" },
  secondary = { label: "Request an AMC", href: "/request-an-amc" },
}: {
  title?: string;
  description?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string } | null;
}) {
  const phone = siteConfig.contact.phones[0];
  return (
    <section aria-labelledby="cta-heading" className="bg-white py-16 sm:py-20">
      <Container>
        <div className="bg-blueprint relative overflow-hidden rounded-2xl bg-navy-900 px-6 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-16">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-brand-red" />
          <div className="max-w-2xl">
            <h2 id="cta-heading" className="text-3xl font-extrabold text-white sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/80">{description}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col xl:flex-row">
            <ButtonLink href={primary.href} size="lg" arrow>
              {primary.label}
            </ButtonLink>
            {secondary ? (
              <ButtonLink href={secondary.href} size="lg" variant="outline-inverse">
                {secondary.label}
              </ButtonLink>
            ) : null}
            <ButtonLink href={`tel:${phone.tel}`} size="lg" variant="outline-inverse">
              <Phone className="size-4" aria-hidden="true" /> {phone.display}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Native details/summary: keyboard and screen-reader friendly without JavaScript.
 * No FAQPage structured data: Google retired FAQ rich results in May 2026, so the
 * markup no longer has a search feature to support. The answers are plain page content.
 */
export function FAQAccordion({ faqs, className }: { faqs: FAQ[]; className?: string }) {
  if (faqs.length === 0) return null;
  return (
    <div className={cn("divide-y divide-line overflow-hidden rounded-xl border border-line bg-white", className)}>
      {faqs.map((f) => (
        <details key={f.question} className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-6 py-5 font-heading text-base font-bold text-navy-900 hover:bg-mist [&::-webkit-details-marker]:hidden">
            {f.question}
            <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line-strong text-navy-900 transition-transform group-open:rotate-45">
              <svg viewBox="0 0 12 12" className="size-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 1.5v9M1.5 6h9" />
              </svg>
            </span>
          </summary>
          <p className="px-6 pb-6 leading-relaxed text-body">{f.answer}</p>
          {f.links?.length ? (
            <p className="-mt-3 flex flex-wrap gap-x-4 gap-y-1 px-6 pb-6 text-sm">
              <span className="text-muted">More:</span>
              {f.links.map((l) => (
                <Link key={l.href} href={l.href} className="font-semibold text-navy-900 underline-offset-4 hover:text-brand-red hover:underline">
                  {l.label}
                </Link>
              ))}
            </p>
          ) : null}
        </details>
      ))}
    </div>
  );
}

export function ProcessSteps({ steps, tone = "light" }: { steps: ProcessStep[]; tone?: "light" | "dark" }) {
  return (
    <ol className={cn("grid gap-5", steps.length >= 6 ? "sm:grid-cols-2 lg:grid-cols-3" : steps.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3")}>
      {steps.map((s, i) => (
        <li
          key={s.title}
          className={cn(
            "relative rounded-xl border p-6",
            tone === "dark" ? "border-white/10 bg-white/4" : "border-line bg-white shadow-card",
          )}
        >
          <span className={cn("font-heading text-sm font-extrabold tracking-widest", tone === "dark" ? "text-brand-red" : "text-brand-red")}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className={cn("mt-3 text-lg font-bold", tone === "dark" && "text-white")}>{s.title}</h3>
          <p className={cn("mt-2 leading-relaxed", tone === "dark" ? "text-white/75" : "text-body")}>{s.description}</p>
        </li>
      ))}
    </ol>
  );
}

export function RelatedServices({ slugs, title = "Related services" }: { slugs: string[]; title?: string }) {
  const related = getServices(slugs);
  if (related.length === 0) return null;
  return (
    <Section tone="mist" labelledBy="related-services">
      <Container>
        <SectionHeading eyebrow="Explore further" title={<span id="related-services">{title}</span>} />
        <div className="mt-10">
          <ServiceGrid services={related} />
        </div>
      </Container>
    </Section>
  );
}

export function EmptyState({ icon, title, children, actions }: { icon: IconName; title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="bg-blueprint-light rounded-2xl border border-dashed border-line-strong bg-mist px-6 py-14 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-xl bg-white text-navy-900 shadow-card">
        <Icon name={icon} className="size-7" />
      </span>
      <h2 className="mt-5 text-2xl font-extrabold">{title}</h2>
      <div className="mx-auto mt-3 max-w-xl leading-relaxed text-body">{children}</div>
      {actions ? <div className="mt-7 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
