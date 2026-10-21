import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { getEquipmentCategory } from "@/content/equipment";
import { getIndustries } from "@/content/industries";
import { projects } from "@/content/projects";
import { getService, services } from "@/content/services";
import { serviceImages } from "@/content/images";
import { ProjectCard } from "@/components/cards/cards";
import { CTASection, FAQAccordion, PageHero, PageHeroFallback, ProcessSteps, RelatedServices } from "@/components/sections/sections";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink, CheckList, Container, Section, SectionHeading } from "@/components/ui/primitives";
import { buildMetadata, serviceJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return buildMetadata({ title: service.seoTitle, description: service.seoDescription, path: `/services/${service.slug}` });
}

export default function ServicePage({ params }: PageProps<"/services/[slug]">) {
  // With Partial Prefetching, params must be awaited inside <Suspense> so the route's
  // shared App Shell can prerender (Next.js guide: ISR with Cache Components).
  return (
    <Suspense fallback={<PageHeroFallback label="service" />}>
      <ServicePageContent params={params} />
    </Suspense>
  );
}

async function ServicePageContent({ params }: Pick<PageProps<"/services/[slug]">, "params">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const isAmc = service.primaryCta === "amc";
  const ctaHref = isAmc ? "/request-an-amc" : `/request-a-quote?service=${service.slug}`;
  const ctaLabel = isAmc ? "Request an AMC" : "Request a Quote";
  const industries = getIndustries(service.industries);
  const caseStudies = projects.filter((p) => p.services.includes(service.slug));
  const categories = service.equipmentCategories.map((c) => getEquipmentCategory(c)).filter((c) => c !== undefined);

  return (
    <>
      <JsonLd data={serviceJsonLd(service)} />
      <PageHero
        eyebrow="Service"
        title={service.title}
        intro={service.heroIntro}
        icon={service.icon}
        image={serviceImages[service.slug]}
        breadcrumbs={[
          { label: "Services", href: "/services" },
          { label: service.shortTitle, href: `/services/${service.slug}` },
        ]}
        actions={
          <>
            <ButtonLink href={ctaHref} size="lg" arrow>
              {ctaLabel}
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="outline-inverse">
              Ask a question
            </ButtonLink>
          </>
        }
      />

      <Section labelledBy="overview">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow="Overview" title={<span id="overview">What this service covers</span>} />
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-body">
              {service.overview.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <aside aria-labelledby="needs" className="rounded-2xl border border-line bg-mist p-7 lg:col-span-5">
            <h2 id="needs" className="text-lg font-bold">
              Customers usually come to us for
            </h2>
            <CheckList items={service.customerNeeds} className="mt-5" />
          </aside>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="scope">
        <Container className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-8 shadow-card">
            <h2 id="scope" className="text-2xl font-extrabold">
              Scope of services
            </h2>
            <CheckList items={service.scope} className="mt-6" />
          </div>
          <div className="rounded-2xl border border-line bg-white p-8 shadow-card">
            <h2 className="text-2xl font-extrabold">Deliverables</h2>
            <CheckList items={service.deliverables} className="mt-6" />
            {service.contractNote ? (
              <p className="mt-6 flex gap-3 rounded-lg bg-navy-50 p-4 text-sm leading-relaxed text-navy-900">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {service.contractNote}
              </p>
            ) : null}
          </div>
        </Container>
      </Section>

      <Section labelledBy="applications">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Applications" title={<span id="applications">Where it is used</span>} />
            <ul className="mt-6 flex flex-wrap gap-2">
              {service.applications.map((a) => (
                <li key={a} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-navy-900">
                  {a}
                </li>
              ))}
            </ul>
            {industries.length > 0 ? (
              <p className="mt-6 text-body">
                Industries:{" "}
                {industries.map((i, idx) => (
                  <span key={i.slug}>
                    <Link href={`/industries/${i.slug}`} className="font-semibold text-navy-900 underline-offset-4 hover:text-brand-red hover:underline">
                      {i.title}
                    </Link>
                    {idx < industries.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            ) : null}
          </div>
          {categories.length > 0 ? (
            <div>
              <SectionHeading eyebrow="Equipment" title="Relevant equipment" />
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/equipment?category=${c.slug}`}
                      className="flex h-full flex-col rounded-xl border border-line p-4 transition-colors hover:border-navy-900"
                    >
                      <span className="font-bold text-navy-900">{c.title}</span>
                      <span className="mt-1 text-sm text-body">{c.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Container>
      </Section>

      <Section tone="navy" labelledBy="approach">
        <Container className="relative">
          <SectionHeading tone="light" eyebrow="Execution approach" title={<span id="approach">How we deliver it</span>} />
          <div className="mt-12">
            <ProcessSteps steps={service.process} tone="dark" />
          </div>
        </Container>
      </Section>

      {service.referenceStandards.length > 0 ? (
        <Section labelledBy="standards">
          <Container className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeading eyebrow="Standards" title={<span id="standards">Codes commonly referenced in India</span>} />
              <p className="mt-5 leading-relaxed text-body">
                Which requirements apply depends on the occupancy, the hazards and the local fire authority. We confirm the applicable
                requirements for each project. This list is general information, not a statement of certification.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Indian Standards, including the national building standards, are published by the{" "}
                <a href="https://www.bis.gov.in/" target="_blank" rel="noopener noreferrer" className="font-semibold text-navy-900 underline underline-offset-4">
                  Bureau of Indian Standards (BIS)
                </a>
                . Check the current edition, any amendments and the edition your local authority applies before relying on a clause.
              </p>
            </div>
            <ul className="divide-y divide-line rounded-xl border border-line lg:col-span-7">
              {service.referenceStandards.map((s) => (
                <li key={s.code} className="flex flex-col gap-1 p-5 sm:flex-row sm:gap-6">
                  <span className="w-40 shrink-0 font-mono text-sm font-bold text-navy-900">{s.code}</span>
                  <span className="text-body">
                    {s.title}
                    {s.source ? (
                      <>
                        {" "}
                        <a href={s.source.href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-navy-900 underline underline-offset-4">
                          Source: {s.source.label}
                        </a>
                      </>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      {caseStudies.length > 0 ? (
        <Section tone="mist" labelledBy="case-studies">
          <Container>
            <SectionHeading eyebrow="Case studies" title={<span id="case-studies">Related projects</span>} />
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {caseStudies.map((p) => (
                <li key={p.slug}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      {service.faqs.length > 0 ? (
        <Section tone={caseStudies.length > 0 ? "white" : "mist"} labelledBy="faqs">
          <Container className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading eyebrow="FAQ" title={<span id="faqs">Questions about {service.shortTitle.toLowerCase()}</span>} />
              <p className="mt-5 text-sm leading-relaxed text-muted">
                Answers about our scope describe how Safe Bharat works. Technical answers are general information: the codes that apply to your
                site, the manufacturer&apos;s instructions and your local fire authority take precedence.
              </p>
            </div>
            <FAQAccordion faqs={service.faqs} className="lg:col-span-8" />
          </Container>
        </Section>
      ) : null}

      <RelatedServices slugs={service.relatedServices} />
      <CTASection
        title={isAmc ? "Plan maintenance for your fire protection systems" : `Discuss your ${service.shortTitle.toLowerCase()} requirement`}
        primary={{ label: ctaLabel, href: ctaHref }}
        secondary={isAmc ? { label: "Request a Quote", href: "/request-a-quote" } : { label: "Request an AMC", href: "/request-an-amc" }}
      />
    </>
  );
}
