import Link from "next/link";
import { services } from "@/content/services";
import { ButtonLink, Container } from "@/components/ui/primitives";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="bg-blueprint-light py-20 sm:py-28">
      <Container className="max-w-3xl text-center">
        <p className="font-heading text-sm font-extrabold tracking-[0.2em] text-brand-red uppercase">Error 404</p>
        <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">We couldn&apos;t find that page</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-body">
          The page may have moved, or the link may be incorrect. These pages may help:
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" variant="secondary">
            Back to home
          </ButtonLink>
          <ButtonLink href="/services" variant="outline">
            Our services
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Contact us
          </ButtonLink>
        </div>
        <ul className="mx-auto mt-12 grid max-w-2xl gap-2 text-left sm:grid-cols-2">
          {services.slice(0, 6).map((s) => (
            <li key={s.slug}>
              <Link href={`/services/${s.slug}`} className="block rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-navy-900 hover:border-navy-900">
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
