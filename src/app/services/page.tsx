import { industries } from "@/content/industries";
import { services } from "@/content/services";
import { howWeWork } from "@/content/company";
import { generalImages } from "@/content/images";
import { IndustryGrid, ServiceGrid } from "@/components/cards/cards";
import { CTASection, PageHero, ProcessSteps } from "@/components/sections/sections";
import { ButtonLink, Container, Section, SectionHeading } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Fire Protection Services in Visakhapatnam",
  description:
    "Fire extinguishers, alarm, hydrant and sprinkler systems, installation, AMC, audits, training, equipment supply and fire crew from Safe Bharat, Visakhapatnam.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Fire protection services"
        intro="From equipment and fixed systems to maintenance, audits and training: one accountable team for the fire safety of your facility."
        breadcrumbs={[{ label: "Services", href: "/services" }]}
        image={generalImages.plantAtNight}
        actions={
          <ButtonLink href="/request-a-quote" size="lg" arrow>
            Request a Quote
          </ButtonLink>
        }
      />
      <Section labelledBy="all-services">
        <Container>
          <h2 id="all-services" className="sr-only">
            All services
          </h2>
          <ServiceGrid services={services} />
        </Container>
      </Section>
      <Section tone="mist" labelledBy="lifecycle">
        <Container>
          <SectionHeading eyebrow="Lifecycle" title={<span id="lifecycle">How an engagement runs</span>} />
          <div className="mt-12">
            <ProcessSteps steps={howWeWork} />
          </div>
        </Container>
      </Section>
      <Section labelledBy="industries">
        <Container>
          <SectionHeading
            eyebrow="Industries"
            title={<span id="industries">Where our services are used</span>}
            action={
              <ButtonLink href="/industries" variant="outline" arrow>
                All industries
              </ButtonLink>
            }
          />
          <div className="mt-12">
            <IndustryGrid industries={industries.slice(0, 3)} />
          </div>
        </Container>
      </Section>
      <CTASection />
    </>
  );
}
