import { industries } from "@/content/industries";
import { generalImages } from "@/content/images";
import { IndustryGrid } from "@/components/cards/cards";
import { CTASection, PageHero } from "@/components/sections/sections";
import { Container, Section } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Industries We Serve: Fire Protection by Sector",
  description:
    "Fire protection for manufacturing, chemical and fertilizer plants, pharmaceutical facilities, commercial buildings, warehouses and industrial infrastructure.",
  path: "/industries",
});

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Fire protection planned around your operations"
        intro="Every sector has its own fire risks, operating constraints and documentation needs. We plan protection and maintenance around how your site works."
        breadcrumbs={[{ label: "Industries", href: "/industries" }]}
        image={generalImages.refinery}
      />
      <Section labelledBy="industry-list">
        <Container>
          <h2 id="industry-list" className="sr-only">
            Industries
          </h2>
          <IndustryGrid industries={industries} />
          <p className="mt-10 max-w-3xl text-sm leading-relaxed text-muted">
            Fire safety requirements depend on the occupancy, processes, the applicable codes and the local fire authority. The descriptions on
            these pages are general and do not guarantee compliance or approval for any particular site.
          </p>
        </Container>
      </Section>
      <CTASection title="Discuss your requirement" primary={{ label: "Talk to an expert", href: "/contact" }} secondary={{ label: "Request a Quote", href: "/request-a-quote" }} />
    </>
  );
}
