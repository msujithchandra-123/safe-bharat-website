import type { PolicySection } from "@/content/legal";
import { PageHero } from "@/components/sections/sections";
import { CheckList, Container, Section } from "@/components/ui/primitives";

export function PolicyPage({ title, path, lastUpdated, sections }: { title: string; path: string; lastUpdated: string; sections: PolicySection[] }) {
  return (
    <>
      <PageHero title={title} breadcrumbs={[{ label: title, href: path }]} intro={`Last updated ${lastUpdated}.`} />
      <Section>
        <Container className="max-w-3xl space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-extrabold">{s.heading}</h2>
              {s.paragraphs?.map((p) => (
                <p key={p} className="mt-4 leading-relaxed text-body">
                  {p}
                </p>
              ))}
              {s.items ? <CheckList items={s.items} className="mt-4" /> : null}
            </section>
          ))}
        </Container>
      </Section>
    </>
  );
}
