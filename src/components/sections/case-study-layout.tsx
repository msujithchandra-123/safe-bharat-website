import Image from "next/image";
import type { Project } from "@/types/content";
import { CTASection, PageHero, RelatedServices } from "@/components/sections/sections";
import { CheckList, Container, Section } from "@/components/ui/primitives";

/** Reusable layout for an approved, completed project. */
export function CaseStudyLayout({ project }: { project: Project }) {
  const facts = [
    { label: "Client", value: project.client },
    { label: "Industry", value: project.industry },
    { label: "Location", value: project.location },
    { label: "Completed", value: project.completedOn },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  return (
    <>
      <PageHero
        eyebrow={project.category}
        title={project.title}
        intro={project.summary}
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: project.title, href: `/projects/${project.slug}` },
        ]}
      />
      <Section labelledBy="project-overview">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            <div>
              <h2 id="project-overview" className="text-2xl font-extrabold">
                The challenge
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-body">{project.challenge}</p>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">Scope</h2>
              <CheckList items={project.scope} className="mt-5" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">Execution</h2>
              <CheckList items={project.execution} className="mt-5" />
            </div>
            {project.outcomes.length > 0 ? (
              <div>
                <h2 className="text-2xl font-extrabold">Outcome</h2>
                <CheckList items={project.outcomes} className="mt-5" />
              </div>
            ) : null}
          </div>
          <aside className="lg:col-span-4">
            <dl className="sticky top-32 space-y-4 rounded-2xl border border-line bg-mist p-6">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-xs font-bold tracking-wider text-muted uppercase">{f.label}</dt>
                  <dd className="mt-1 font-semibold text-navy-900">{f.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </Container>
        {project.images.length > 0 ? (
          <Container className="mt-14 grid gap-5 sm:grid-cols-2">
            {project.images.map((img) => (
              <Image key={img.src} src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(min-width: 640px) 50vw, 100vw" className="h-auto w-full rounded-xl" />
            ))}
          </Container>
        ) : null}
      </Section>
      <RelatedServices slugs={project.services} title="Services used on this project" />
      <CTASection title="Need a similar solution?" primary={{ label: "Request a similar solution", href: "/request-a-quote" }} />
    </>
  );
}
