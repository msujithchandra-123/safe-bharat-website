import { brandValues, company, generalFaqs, howWeWork, whyChooseUs } from "@/content/company";
import { equipmentCategories } from "@/content/equipment";
import { equipmentCategoryImages } from "@/content/images";
import { industries } from "@/content/industries";
import { projects } from "@/content/projects";
import { resources } from "@/content/resources";
import { featuredServiceSlugs, getServices } from "@/content/services";
import { testimonials } from "@/content/testimonials";
import { IndustryGrid, ProjectCard, ResourceCard, ServiceGrid } from "@/components/cards/cards";
import { HeroSection } from "@/components/sections/hero-section";
import { CTASection, FAQAccordion, ProcessSteps, TrustStrip } from "@/components/sections/sections";
import { JsonLd } from "@/components/seo/json-ld";
import { Icon } from "@/components/ui/icon";
import { SiteImage } from "@/components/ui/site-image";
import { Reveal } from "@/components/ui/motion";
import { ButtonLink, CheckList, Container, Section, SectionHeading } from "@/components/ui/primitives";
import Link from "next/link";
import { buildMetadata, homeJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: { absolute: "Fire Protection Systems & AMC in Visakhapatnam | Safe Bharat" },
  description:
    "Fire extinguishers, fire alarm, hydrant and sprinkler systems: supply, installation, AMC and training for industrial sites in Visakhapatnam, Andhra Pradesh.",
  path: "/",
});

export default function HomePage() {
  const featured = getServices(featuredServiceSlugs);
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <HeroSection />
      <div className="pt-6">
        <TrustStrip />
      </div>

      {/* Introduction */}
      <Section labelledBy="intro-heading">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Who we are"
              title={<span id="intro-heading">Safety is more than equipment. It&apos;s a system.</span>}
            />
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-body">
              {company.overview.slice(0, 2).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <ButtonLink href="/about" variant="secondary" className="mt-8" arrow>
              Discover Safe Bharat
            </ButtonLink>
          </Reveal>
          <ul className="grid gap-4">
            {brandValues.map((v, i) => (
              <li key={v.title}>
                <Reveal delay={i * 0.06}>
                  <div className="flex gap-5 rounded-xl border border-line bg-mist p-6">
                    <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-navy-900 text-white">
                      <Icon name={v.icon} className="size-6" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold">{v.title}</h3>
                      <p className="mt-1 leading-relaxed text-body">{v.description}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Services */}
      <Section tone="mist" labelledBy="services-heading">
        <Container>
          <SectionHeading
            eyebrow="Our solutions"
            title={<span id="services-heading">Fire protection, from first survey to long-term maintenance</span>}
            description="Each service can be engaged on its own or combined into a single programme for your facility."
            action={
              <ButtonLink href="/services" variant="outline" arrow>
                All services
              </ButtonLink>
            }
          />
          <Reveal className="mt-12">
            <ServiceGrid services={featured} />
          </Reveal>
        </Container>
      </Section>

      {/* How we work */}
      <Section tone="navy" labelledBy="process-heading">
        <Container className="relative">
          <SectionHeading
            tone="light"
            eyebrow="How we work"
            title={<span id="process-heading">A clear, accountable process</span>}
            description="Every engagement follows the same disciplined path, so you know what happens next and what you will receive."
          />
          <Reveal className="mt-12">
            <ProcessSteps steps={howWeWork} tone="dark" />
          </Reveal>
        </Container>
      </Section>

      {/* Industries */}
      <Section labelledBy="industries-heading">
        <Container>
          <SectionHeading
            eyebrow="Industries served"
            title={<span id="industries-heading">Protection planned around how your site operates</span>}
            action={
              <ButtonLink href="/industries" variant="outline" arrow>
                All industries
              </ButtonLink>
            }
          />
          <Reveal className="mt-12">
            <IndustryGrid industries={industries} />
          </Reveal>
        </Container>
      </Section>

      {/* Why Safe Bharat */}
      <Section tone="mist" labelledBy="why-heading">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Why Safe Bharat" title={<span id="why-heading">Engineering discipline. Honest advice.</span>} />
            <p className="mt-5 leading-relaxed text-body">
              We recommend what your site actually needs, carry the work out carefully, and document it clearly, then stay involved through
              maintenance.
            </p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
            {whyChooseUs.map((w, i) => (
              <li key={w.title} className={i === whyChooseUs.length - 1 ? "sm:col-span-2" : undefined}>
                <Reveal delay={i * 0.04}>
                  <div className="h-full rounded-xl border border-line bg-white p-6 shadow-card">
                    <Icon name={w.icon} className="size-6 text-brand-red" />
                    <h3 className="mt-4 text-lg font-bold">{w.title}</h3>
                    <p className="mt-2 leading-relaxed text-body">{w.description}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Equipment */}
      <Section labelledBy="equipment-heading">
        <Container>
          <SectionHeading
            eyebrow="Equipment"
            title={<span id="equipment-heading">Fire and safety equipment for every part of your site</span>}
            description="Selected for the application and quoted for your requirement. Installation and servicing are available for everything we supply."
            action={
              <ButtonLink href="/equipment" variant="outline" arrow>
                Browse the catalogue
              </ButtonLink>
            }
          />
          <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {equipmentCategories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/equipment?category=${c.slug}`}
                  className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-xl border border-line bg-navy-50 transition-shadow hover:shadow-raised"
                >
                  <SiteImage
                    image={equipmentCategoryImages[c.slug]}
                    sizes="(min-width: 1024px) 14rem, (min-width: 768px) 33vw, 50vw"
                    decorative
                    fallbackIcon={c.icon}
                    className="transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/25 to-transparent" />
                  <span className="relative flex items-center gap-2 p-4 font-heading text-sm font-bold text-white">
                    <Icon name={c.icon} className="size-4 shrink-0 text-white" strokeWidth={2} />
                    {c.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Featured projects: shown only when approved case studies exist */}
      {projects.length > 0 ? (
        <Section tone="mist" labelledBy="projects-heading">
          <Container>
            <SectionHeading
              eyebrow="Projects"
              title={<span id="projects-heading">Recent work</span>}
              action={
                <ButtonLink href="/projects" variant="outline" arrow>
                  All projects
                </ButtonLink>
              }
            />
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 3).map((p) => (
                <li key={p.slug}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      {/* Maintenance and training */}
      <Section tone="navy" labelledBy="lifecycle-heading">
        <Container className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              tone="light"
              eyebrow="Maintenance & training"
              title={<span id="lifecycle-heading">Protection doesn&apos;t stop after installation.</span>}
              description="Systems are only dependable if they are tested, maintained and understood by the people on site."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/services/amc-maintenance" variant="inverse" arrow>
                AMC & maintenance
              </ButtonLink>
              <ButtonLink href="/services/fire-safety-training" variant="outline-inverse">
                Fire safety training
              </ButtonLink>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/4 p-6">
              <Icon name="calendarCheck" className="size-7 text-brand-red" />
              <h3 className="mt-4 text-lg font-bold text-white">Annual Maintenance Contracts</h3>
              <CheckList
                tone="light"
                className="mt-4 text-sm"
                items={["Scheduled inspection and servicing", "Reports after every visit", "Defects tracked to closure"]}
              />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/4 p-6">
              <Icon name="graduationCap" className="size-7 text-brand-red" />
              <h3 className="mt-4 text-lg font-bold text-white">On-site training</h3>
              <CheckList
                tone="light"
                className="mt-4 text-sm"
                items={["Fire safety awareness", "Extinguisher familiarisation", "Evacuation drill support"]}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Testimonials: shown only when genuine, approved testimonials exist */}
      {testimonials.length > 0 ? (
        <Section labelledBy="testimonials-heading">
          <Container>
            <SectionHeading eyebrow="Customers" title={<span id="testimonials-heading">What our customers say</span>} />
            <ul className="mt-12 grid gap-5 md:grid-cols-2">
              {testimonials.map((t) => (
                <li key={t.quote}>
                  <figure className="h-full rounded-xl border border-line bg-white p-8 shadow-card">
                    <blockquote className="text-lg leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
                    <figcaption className="mt-6 text-sm text-muted">
                      <span className="font-bold text-navy-900">{t.name}</span>, {t.role}, {t.company}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      {/* Resources */}
      <Section tone="mist" labelledBy="resources-heading">
        <Container>
          <SectionHeading
            eyebrow="Knowledge centre"
            title={<span id="resources-heading">Practical fire safety guidance</span>}
            action={
              <ButtonLink href="/resources" variant="outline" arrow>
                Explore resources
              </ButtonLink>
            }
          />
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {resources.slice(0, 3).map((r) => (
              <li key={r.slug}>
                <ResourceCard resource={r} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* FAQ */}
      <Section id="faq" labelledBy="faq-heading">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="FAQ" title={<span id="faq-heading">Frequently asked questions</span>} />
            <p className="mt-5 leading-relaxed text-body">
              Can&apos;t find what you need?{" "}
              <Link href="/contact" className="font-semibold text-brand-red underline-offset-4 hover:underline">
                Contact our team
              </Link>
              .
            </p>
          </div>
          <FAQAccordion faqs={generalFaqs} className="lg:col-span-8" />
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
