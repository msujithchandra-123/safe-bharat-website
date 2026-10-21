import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getIndustry, industries } from "@/content/industries";
import { industryImages } from "@/content/images";
import { getServices } from "@/content/services";
import { IndustryGrid, ServiceGrid } from "@/components/cards/cards";
import { CTASection, FAQAccordion, PageHero, PageHeroFallback } from "@/components/sections/sections";
import { ButtonLink, CheckList, Container, Section, SectionHeading } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/industries/[slug]">) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};
  return buildMetadata({ title: industry.seoTitle, description: industry.seoDescription, path: `/industries/${industry.slug}` });
}

export default function IndustryPage({ params }: PageProps<"/industries/[slug]">) {
  // With Partial Prefetching, params must be awaited inside <Suspense> so the route's
  // shared App Shell can prerender (Next.js guide: ISR with Cache Components).
  return (
    <Suspense fallback={<PageHeroFallback label="industry" />}>
      <IndustryPageContent params={params} />
    </Suspense>
  );
}

async function IndustryPageContent({ params }: Pick<PageProps<"/industries/[slug]">, "params">) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();
  const relevant = getServices(industry.relevantServices);
  const others = industries.filter((i) => i.slug !== industry.slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow="Industry"
        title={`Fire protection for ${industry.title.toLowerCase()}`}
        intro={industry.intro}
        icon={industry.icon}
        image={industryImages[industry.slug]}
        breadcrumbs={[
          { label: "Industries", href: "/industries" },
          { label: industry.title, href: `/industries/${industry.slug}` },
        ]}
        actions={
          <ButtonLink href="/contact" size="lg" arrow>
            Talk to an expert
          </ButtonLink>
        }
      />
      <Section labelledBy="needs">
        <Container className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-8 shadow-card">
            <h2 id="needs" className="text-2xl font-extrabold">
              Typical fire safety needs
            </h2>
            <CheckList items={industry.typicalNeeds} className="mt-6" />
          </div>
          <div className="rounded-2xl border border-line bg-mist p-8">
            <h2 className="text-2xl font-extrabold">How Safe Bharat helps</h2>
            <CheckList items={industry.howWeHelp} className="mt-6" />
          </div>
        </Container>
        <Container>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
            Requirements for your site depend on its occupancy, processes and the local authority. We confirm them during the site survey.
          </p>
        </Container>
      </Section>
      <Section tone="mist" labelledBy="recommended">
        <Container>
          <SectionHeading eyebrow="Recommended services" title={<span id="recommended">Services for {industry.title.toLowerCase()}</span>} />
          <div className="mt-10">
            <ServiceGrid services={relevant} />
          </div>
        </Container>
      </Section>
      {industry.faqs.length > 0 ? (
        <Section labelledBy="faqs">
          <Container className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading eyebrow="FAQ" title={<span id="faqs">Common questions</span>} />
            </div>
            <FAQAccordion faqs={industry.faqs} className="lg:col-span-8" />
          </Container>
        </Section>
      ) : null}
      <Section tone="mist" labelledBy="other-industries">
        <Container>
          <SectionHeading eyebrow="Other industries" title={<span id="other-industries">Explore other sectors</span>} />
          <div className="mt-10">
            <IndustryGrid industries={others} />
          </div>
        </Container>
      </Section>
      <CTASection title="Discuss your site's fire safety needs" primary={{ label: "Talk to an expert", href: "/contact" }} />
    </>
  );
}
