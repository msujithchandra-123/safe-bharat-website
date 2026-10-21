import Image, { getImageProps } from "next/image";
import { lifecycle } from "@/content/company";
import { homeHeroImages, type HomeHeroImages } from "@/content/images";
import { ButtonLink, Container, Eyebrow, cn } from "@/components/ui/primitives";

/** Rendered width of the image column: half the 1216px container at xl, half the viewport at lg, full width below. */
const DESKTOP_SIZES = "(min-width: 1280px) 588px, (min-width: 1024px) calc(50vw - 52px), calc(100vw - 48px)";
const MOBILE_SIZES = "calc(100vw - 32px)";

/**
 * One image for every width via `next/image`, or, if a portrait crop is
 * registered, art direction with `getImageProps` + `<picture>` (3:4 on phones,
 * 3:2 from 640px). Above the fold and the likely LCP element on desktop, so it
 * loads eagerly with high fetch priority, as the Next.js docs recommend over
 * `preload` in most cases.
 */
function HeroImage({ desktop, mobile }: HomeHeroImages) {
  const shared = { alt: desktop.alt, loading: "eager", fetchPriority: "high" } as const;
  if (!mobile) {
    // One image for every width: the standard optimised component is enough.
    return <Image {...shared} alt={desktop.alt} src={desktop.src} fill sizes={DESKTOP_SIZES} className="object-cover" style={{ objectPosition: desktop.position }} />;
  }
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...shared, src: desktop.src, width: desktop.width, height: desktop.height, sizes: DESKTOP_SIZES });
  const {
    props: { srcSet: mobileSrcSet, ...imgProps },
  } = getImageProps({ ...shared, src: mobile.src, width: mobile.width, height: mobile.height, sizes: MOBILE_SIZES });
  return (
    <picture>
      <source media="(min-width: 640px)" srcSet={desktopSrcSet} sizes={DESKTOP_SIZES} width={desktop.width} height={desktop.height} />
      <img {...imgProps} alt={desktop.alt} srcSet={mobileSrcSet} className="absolute inset-0 size-full object-cover" style={{ objectPosition: mobile.position }} />
    </picture>
  );
}

export function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="bg-blueprint relative isolate overflow-hidden bg-navy-900 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute top-0 -left-32 -z-10 size-[36rem] rounded-full bg-navy-700/50 blur-3xl" />
      <Container className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-10 lg:py-24">
        <div className="animate-fade-up lg:col-span-6">
          <Eyebrow tone="light">Fire protection · Visakhapatnam, Andhra Pradesh</Eyebrow>
          <h1 id="hero-heading" className="mt-6 text-[2.6rem] leading-[1.05] font-extrabold text-white sm:text-6xl">
            Engineered for Safety.{" "}
            <span className="mt-1 block">
              Built on <span className="relative whitespace-nowrap">Trust.<span aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-1.5 rounded-full bg-brand-red" /></span>
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/80">
            Safe Bharat supplies fire protection equipment, installs and commissions fire alarm, hydrant and sprinkler systems, and services and
            maintains them for industrial and commercial customers.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/request-a-quote" size="lg" arrow>
              Request a Quote
            </ButtonLink>
            <ButtonLink href="/services" size="lg" variant="outline-inverse">
              Explore Our Solutions
            </ButtonLink>
          </div>
          <div className="mt-12">
            <p className="text-xs font-semibold tracking-[0.14em] text-white/60 uppercase">One team across the lifecycle</p>
            <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-semibold text-white/90">
              {lifecycle.map((step, i) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1">{step}</span>
                  {i < lifecycle.length - 1 ? (
                    <span aria-hidden="true" className="text-brand-red">
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="lg:col-span-6">
          {/* Fixed 3:2 frame (3:4 on phones if a portrait crop is registered): reserves the space, so there is no layout shift. */}
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border border-white/15 bg-navy-800 shadow-2xl shadow-black/40",
              homeHeroImages.mobile ? "aspect-[3/4] sm:aspect-[3/2]" : "aspect-[3/2]",
            )}
          >
            <HeroImage {...homeHeroImages} />
          </div>
        </div>
      </Container>
    </section>
  );
}
