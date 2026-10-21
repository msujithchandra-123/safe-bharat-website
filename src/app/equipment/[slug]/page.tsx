import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { equipment, getEquipmentByCategory, getEquipmentCategory, getEquipmentItem } from "@/content/equipment";
import { equipmentItemImages } from "@/content/images";
import { EquipmentCard } from "@/components/cards/cards";
import { ImageCreditLine } from "@/components/ui/image-credit";
import { SiteImage } from "@/components/ui/site-image";
import { EquipmentEnquiryForm } from "@/components/forms/enquiry-forms";
import { PageHero, PageHeroFallback, RelatedServices } from "@/components/sections/sections";
import { CheckList, Container, Section, SectionHeading } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

/** Adds who supplies it and where, when the summary leaves room in the search snippet. */
function equipmentDescription(summary: string): string {
  const suffix = " Quoted for your requirement by Safe Bharat, Visakhapatnam.";
  return summary.length + suffix.length <= 160 ? summary + suffix : summary;
}

export function generateStaticParams() {
  return equipment.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/equipment/[slug]">) {
  const { slug } = await params;
  const item = getEquipmentItem(slug);
  if (!item) return {};
  return buildMetadata({ title: item.name, description: equipmentDescription(item.summary), path: `/equipment/${item.slug}` });
}

export default function EquipmentItemPage({ params }: PageProps<"/equipment/[slug]">) {
  // With Partial Prefetching, params must be awaited inside <Suspense> so the route's
  // shared App Shell can prerender (Next.js guide: ISR with Cache Components).
  return (
    <Suspense fallback={<PageHeroFallback label="product" />}>
      <EquipmentItemPageContent params={params} />
    </Suspense>
  );
}

async function EquipmentItemPageContent({ params }: Pick<PageProps<"/equipment/[slug]">, "params">) {
  const { slug } = await params;
  const item = getEquipmentItem(slug);
  if (!item) notFound();
  const category = getEquipmentCategory(item.category);
  const siblings = getEquipmentByCategory(item.category)
    .filter((e) => e.slug !== item.slug)
    .slice(0, 4);

  return (
    <>
      <PageHero
        eyebrow={category?.title ?? "Equipment"}
        title={item.name}
        intro={item.summary}
        icon={item.icon}
        breadcrumbs={[
          { label: "Equipment", href: "/equipment" },
          { label: item.name, href: `/equipment/${item.slug}` },
        ]}
      />
      <Section>
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-7">
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-mist">
                <SiteImage image={equipmentItemImages[item.slug]} sizes="(min-width: 1024px) 40rem, 100vw" priority fallbackIcon={item.icon} />
              </div>
              <figcaption className="mt-2 text-xs text-muted">
                {equipmentItemImages[item.slug]
                  ? "Illustrative photo of this equipment type. The make and model supplied are confirmed in our quotation."
                  : "Product photo to follow. The make and model supplied are confirmed in our quotation."}
                {equipmentItemImages[item.slug]?.credit ? (
                  <>
                    {" "}
                    <ImageCreditLine credit={equipmentItemImages[item.slug]!.credit!} />
                  </>
                ) : null}
              </figcaption>
            </figure>
            <div className="space-y-4 text-lg leading-relaxed text-body">
              {item.description.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div>
              <h2 className="text-xl font-extrabold">Typical applications</h2>
              <CheckList items={item.applications} className="mt-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">Specifications</h2>
              {item.specifications.length > 0 ? (
                <dl className="mt-5 divide-y divide-line rounded-xl border border-line">
                  {item.specifications.map((s) => (
                    <div key={s.label} className="grid grid-cols-2 gap-4 p-4 text-sm">
                      <dt className="font-semibold text-navy-900">{s.label}</dt>
                      <dd className="text-body">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-4 rounded-lg bg-mist p-4 leading-relaxed text-body">
                  Make, model, capacity and rating are selected for your application and confirmed in our quotation, along with the
                  manufacturer&apos;s documentation.
                </p>
              )}
              {item.manufacturer ? <p className="mt-4 text-sm text-body">Manufacturer: {item.manufacturer}</p> : null}
              {item.datasheetUrl ? (
                <a href={item.datasheetUrl} className="mt-4 inline-flex items-center gap-2 font-semibold text-navy-900 underline" target="_blank" rel="noopener noreferrer">
                  <FileText className="size-4" aria-hidden="true" /> Download datasheet (PDF)
                </a>
              ) : null}
            </div>
          </div>
          <aside aria-labelledby="enquire" className="lg:col-span-5">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-raised sm:p-8 lg:sticky lg:top-32">
              <h2 id="enquire" className="text-2xl font-extrabold">
                Enquire about this product
              </h2>
              <p className="mt-2 mb-6 text-sm leading-relaxed text-body">Tell us your requirement and we will respond with availability and a quotation.</p>
              <EquipmentEnquiryForm productSlug={item.slug} productName={item.name} />
            </div>
          </aside>
        </Container>
      </Section>
      {siblings.length > 0 ? (
        <Section tone="mist" labelledBy="similar">
          <Container>
            <SectionHeading eyebrow={category?.title} title={<span id="similar">Related equipment</span>} />
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <EquipmentCard item={s} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}
      <RelatedServices slugs={item.relatedServices} />
    </>
  );
}
