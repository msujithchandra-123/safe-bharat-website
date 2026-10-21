import { Suspense } from "react";
import { PageHeroFallback } from "@/components/sections/sections";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { CaseStudyLayout } from "@/components/sections/case-study-layout";
import { buildMetadata } from "@/lib/seo";

/**
 * Cache Components requires at least one static param. Until approved case
 * studies exist, a reserved placeholder slug is prerendered and resolves to 404.
 */
const PLACEHOLDER_SLUG = "__no-published-projects__";

export function generateStaticParams() {
  return projects.length > 0 ? projects.map((p) => ({ slug: p.slug })) : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return buildMetadata({ title: project.title, description: project.summary, path: `/projects/${project.slug}` });
}

export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  // With Partial Prefetching, params must be awaited inside <Suspense> so the route's
  // shared App Shell can prerender (Next.js guide: ISR with Cache Components).
  return (
    <Suspense fallback={<PageHeroFallback label="project" />}>
      <ProjectPageContent params={params} />
    </Suspense>
  );
}

async function ProjectPageContent({ params }: Pick<PageProps<"/projects/[slug]">, "params">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <CaseStudyLayout project={project} />;
}
