import type { ReactNode } from "react";
import { Mail, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { PageHero } from "@/components/sections/sections";
import { CheckList, Container, Section } from "@/components/ui/primitives";
import type { Crumb } from "@/components/layout/breadcrumbs";

/** Shared layout for the quote and AMC request pages. */
export function EnquiryPageLayout({
  title,
  intro,
  breadcrumbs,
  steps,
  children,
}: {
  title: string;
  intro: string;
  breadcrumbs: Crumb[];
  steps: string[];
  children: ReactNode;
}) {
  return (
    <>
      <PageHero eyebrow="Enquiry" title={title} intro={intro} breadcrumbs={breadcrumbs} />
      <Section>
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-10 lg:col-span-8">{children}</div>
          <aside className="space-y-5 lg:col-span-4" aria-label="What happens next">
            <div className="rounded-2xl border border-line bg-mist p-7">
              <h2 className="text-lg font-bold">What happens next</h2>
              <CheckList items={steps} className="mt-5 text-[15px]" />
            </div>
            <div className="rounded-2xl bg-navy-900 p-7 text-white">
              <h2 className="text-lg font-bold text-white">Prefer to talk?</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {siteConfig.contact.phones.map((p) => (
                  <li key={p.tel}>
                    <a href={`tel:${p.tel}`} className="inline-flex items-center gap-2 font-semibold hover:underline">
                      <Phone className="size-4 text-brand-red" aria-hidden="true" /> {p.display}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={`mailto:${siteConfig.contact.email}`} className="inline-flex items-center gap-2 font-semibold break-all hover:underline">
                    <Mail className="size-4 text-brand-red" aria-hidden="true" /> {siteConfig.contact.email}
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}
