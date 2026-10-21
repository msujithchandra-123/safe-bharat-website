import { projects } from "@/content/projects";
import { ProjectBrowser } from "@/components/sections/project-browser";
import { CTASection, EmptyState, PageHero } from "@/components/sections/sections";
import { ButtonLink, Container, Section } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Projects",
  description: "Completed fire protection projects and case studies from Safe Bharat Fire and Safety Solutions.",
  path: "/projects",
  // An empty portfolio page is thin content: kept out of search until approved case studies are published.
  noindex: projects.length === 0,
});

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="Projects & case studies"
        intro="Completed work, published with our customers' approval."
        breadcrumbs={[{ label: "Projects", href: "/projects" }]}
      />
      <Section>
        <Container>
          {projects.length > 0 ? (
            <ProjectBrowser projects={projects} />
          ) : (
            <EmptyState
              icon="clipboardList"
              title="Our project portfolio is being prepared"
              actions={
                <>
                  <ButtonLink href="/contact" arrow>
                    Ask for references
                  </ButtonLink>
                  <ButtonLink href="/services" variant="outline">
                    Explore our services
                  </ButtonLink>
                </>
              }
            >
              <p>
                We only publish projects once they are complete and our customers have approved the details. Case studies will appear here as they
                are approved. In the meantime, ask us for references relevant to your sector.
              </p>
            </EmptyState>
          )}
        </Container>
      </Section>
      <CTASection />
    </>
  );
}
