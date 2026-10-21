import { generalFaqs } from "@/content/company";
import { resources } from "@/content/resources";
import { ResourceCard } from "@/components/cards/cards";
import { CTASection, FAQAccordion, PageHero } from "@/components/sections/sections";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Fire Safety Resources",
  description: "Practical fire safety guides: extinguisher selection, fire alarm maintenance, AMC planning, emergency preparedness and industrial fire safety FAQs.",
  path: "/resources",
});

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Knowledge centre"
        title="Fire safety resources"
        intro="Plain-language guidance for facility, safety and maintenance teams. Always confirm site-specific requirements with a competent professional and the applicable codes."
        breadcrumbs={[{ label: "Resources", href: "/resources" }]}
      />
      <Section labelledBy="guides">
        <Container>
          <h2 id="guides" className="sr-only">
            Guides and checklists
          </h2>
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <li key={r.slug}>
                <ResourceCard resource={r} headingLevel="h3" />
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <Section tone="mist" labelledBy="faq">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="FAQ" title={<span id="faq">Frequently asked questions</span>} />
          </div>
          <FAQAccordion faqs={generalFaqs} className="lg:col-span-8" />
        </Container>
      </Section>
      <CTASection />
    </>
  );
}
