import { allSiteImages } from "@/content/images";
import { PageHero } from "@/components/sections/sections";
import { ImageCreditLine } from "@/components/ui/image-credit";
import { Container, Section } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Image Credits",
  description: "Attribution for photographs used on the Safe Bharat website under Creative Commons and public-domain terms.",
  path: "/image-credits",
});

export default function ImageCreditsPage() {
  const credited = allSiteImages().filter((i) => i.credit);
  return (
    <>
      <PageHero
        title="Image credits"
        breadcrumbs={[{ label: "Image credits", href: "/image-credits" }]}
        intro="Some product photos on this site are reproduced from Wikimedia Commons. They illustrate equipment types and do not show Safe Bharat installations or the specific makes we supply."
      />
      <Section>
        <Container className="max-w-3xl">
          <ul className="divide-y divide-line rounded-xl border border-line">
            {credited.map((image) => (
              <li key={image.src} className="p-5 text-sm leading-relaxed text-body">
                <p className="font-semibold text-navy-900">{image.alt}</p>
                <p className="mt-1">
                  <ImageCreditLine credit={image.credit!} />
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm leading-relaxed text-muted">
            Images adapted from CC BY-SA originals are shared under the same licence. Other photographs on this site come from Unsplash and Pexels,
            whose licences do not require attribution; company images are owned by Safe Bharat Fire and Safety Solutions.
          </p>
        </Container>
      </Section>
    </>
  );
}
