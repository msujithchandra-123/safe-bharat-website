import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Info, TriangleAlert } from "lucide-react";
import { getResource, isIndexable, resources } from "@/content/resources";
import { resourceImages } from "@/content/images";
import { ResourceCard } from "@/components/cards/cards";
import { CTASection, FAQAccordion, PageHero, PageHeroFallback, RelatedServices } from "@/components/sections/sections";
import { CheckList, Container, Section, cn } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";
import type { ResourceBlock } from "@/types/content";

export function generateStaticParams() {
  return resources.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/resources/[slug]">) {
  const { slug } = await params;
  const resource = getResource(slug);
  if (!resource) return {};
  return buildMetadata({ title: resource.title, description: resource.summary, path: `/resources/${resource.slug}`, noindex: !isIndexable(resource) });
}

function Block({ block }: { block: ResourceBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className="text-lg leading-relaxed text-body">{block.text}</p>;
    case "list":
      return <CheckList items={block.items} />;
    case "callout": {
      const warning = block.tone === "warning";
      const IconC = warning ? TriangleAlert : Info;
      return (
        <p className={cn("flex gap-3 rounded-lg p-4 leading-relaxed", warning ? "bg-warning-50 text-ink" : "bg-navy-50 text-navy-900")}>
          <IconC className={cn("mt-0.5 size-5 shrink-0", warning ? "text-warning" : "text-navy-700")} aria-hidden="true" />
          {block.text}
        </p>
      );
    }
  }
}

export default function ResourcePage({ params }: PageProps<"/resources/[slug]">) {
  // With Partial Prefetching, params must be awaited inside <Suspense> so the route's
  // shared App Shell can prerender (Next.js guide: ISR with Cache Components).
  return (
    <Suspense fallback={<PageHeroFallback label="guide" />}>
      <ResourcePageContent params={params} />
    </Suspense>
  );
}

async function ResourcePageContent({ params }: Pick<PageProps<"/resources/[slug]">, "params">) {
  const { slug } = await params;
  const resource = getResource(slug);
  if (!resource) notFound();
  const more = resources.filter((r) => r.slug !== resource.slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={`${resource.category} · ${resource.readingMinutes} min read`}
        title={resource.title}
        intro={resource.summary}
        image={resourceImages[resource.slug]}
        breadcrumbs={[
          { label: "Resources", href: "/resources" },
          { label: resource.title, href: `/resources/${resource.slug}` },
        ]}
      />
      <Section>
        <Container className="max-w-3xl">
          {resource.review.status === "pending" ? (
            <p className="mb-10 flex gap-3 rounded-lg border border-line bg-mist p-4 text-sm leading-relaxed text-body">
              <Info className="mt-0.5 size-4 shrink-0 text-navy-900" aria-hidden="true" />
              General information only, currently undergoing technical review. It does not replace the applicable codes, manufacturer
              instructions or advice from a competent professional for your site.
            </p>
          ) : (
            <p className="mb-10 text-sm text-muted">
              Reviewed by {resource.review.reviewedBy} on {resource.review.reviewedOn}.
            </p>
          )}
          <article className="space-y-12">
            {resource.sections.map((section) => (
              <section key={section.heading} className="space-y-5">
                <h2 className="text-2xl font-extrabold">{section.heading}</h2>
                {section.blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </section>
            ))}
            {resource.faqs ? <FAQAccordion faqs={resource.faqs} /> : null}
          </article>
        </Container>
      </Section>
      <RelatedServices slugs={resource.relatedServices} />
      <Section labelledBy="more">
        <Container>
          <h2 id="more" className="text-2xl font-extrabold">
            More resources
          </h2>
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {more.map((r) => (
              <li key={r.slug}>
                <ResourceCard resource={r} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <CTASection />
    </>
  );
}
