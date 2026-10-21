import { siteConfig } from "@/config/site";
import Image from "next/image";
import { companyBannerImage } from "@/content/images";
import { brandValues, company, howWeWork, whyChooseUs } from "@/content/company";
import { CTASection, PageHero, ProcessSteps } from "@/components/sections/sections";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/motion";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Us: Fire Protection Company in Visakhapatnam",
  description:
    "Safe Bharat Fire and Safety Solutions is a fire protection company in Visakhapatnam: equipment supply, system installation, maintenance, audits and training.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Safe Bharat"
        title="Committed to safety. Dedicated to protection."
        intro={company.brandMessage}
        breadcrumbs={[{ label: "About", href: "/about" }]}
      />

      <Section labelledBy="overview-heading">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <SectionHeading eyebrow="Who we are" title={<span id="overview-heading">A fire protection partner for industry and enterprise</span>} />
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-body">
              {company.overview.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <Reveal>
            <Image
              src={companyBannerImage.src}
              alt={companyBannerImage.alt}
              width={companyBannerImage.width}
              height={companyBannerImage.height}
              sizes="(min-width: 1024px) 38rem, calc(100vw - 2rem)"
              className="h-auto w-full rounded-2xl border border-line object-contain shadow-raised"
            />
          </Reveal>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="mission-heading">
        <Container>
          <h2 id="mission-heading" className="sr-only">
            Mission and vision
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { label: "Our mission", text: company.mission, icon: "shieldCheck" as const },
              { label: "Our vision", text: company.vision, icon: "route" as const },
            ].map((b) => (
              <div key={b.label} className="rounded-2xl border border-line bg-white p-8 shadow-card sm:p-10">
                <Icon name={b.icon} className="size-8 text-brand-red" />
                <h3 className="mt-5 text-2xl font-extrabold">{b.label}</h3>
                <p className="mt-3 text-lg leading-relaxed text-body">{b.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section labelledBy="values-heading">
        <Container>
          <SectionHeading eyebrow="Brand values" title={<span id="values-heading">{siteConfig.values.join(". ")}.</span>} align="center" />
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {brandValues.map((v) => (
              <li key={v.title} className="rounded-xl border border-line bg-white p-8 text-center shadow-card">
                <span className="mx-auto grid size-14 place-items-center rounded-xl bg-navy-900 text-white">
                  <Icon name={v.icon} className="size-7" />
                </span>
                <h3 className="mt-5 text-xl font-bold">{v.title}</h3>
                <p className="mt-2 leading-relaxed text-body">{v.description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="navy" labelledBy="philosophy-heading">
        <Container className="relative grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading tone="light" eyebrow="Safety philosophy" title={<span id="philosophy-heading">How we think about protection</span>} />
          </div>
          <ul className="space-y-6 lg:col-span-7">
            {company.safetyPhilosophy.map((p, i) => (
              <li key={p} className="flex gap-5 border-l-2 border-brand-red pl-5">
                <span className="font-heading text-sm font-extrabold text-brand-red">0{i + 1}</span>
                <p className="text-lg leading-relaxed text-white/85">{p}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section labelledBy="why-heading">
        <Container>
          <SectionHeading eyebrow="Why Safe Bharat" title={<span id="why-heading">What you can expect from us</span>} />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyChooseUs.map((w) => (
              <li key={w.title} className="rounded-xl border border-line bg-white p-6 shadow-card">
                <Icon name={w.icon} className="size-6 text-brand-red" />
                <h3 className="mt-4 text-lg font-bold">{w.title}</h3>
                <p className="mt-2 leading-relaxed text-body">{w.description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="mist" labelledBy="process-heading">
        <Container>
          <SectionHeading eyebrow="Our process" title={<span id="process-heading">From understanding to long-term support</span>} />
          <div className="mt-12">
            <ProcessSteps steps={howWeWork} />
          </div>
        </Container>
      </Section>

      <Section labelledBy="credentials-heading">
        <Container className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow="Business details" title={<span id="credentials-heading">Registered and based in Visakhapatnam</span>} />
            <p className="mt-5 leading-relaxed text-body">
              Safe Bharat is a GST-registered business. Certifications, authorisations and team details will be published here once verified
              documentation is available. Ask us for any credentials your procurement process requires.
            </p>
          </div>
          <dl className="grid gap-4 rounded-xl border border-line bg-mist p-6 lg:col-span-5">
            <div>
              <dt className="text-xs font-bold tracking-wider text-muted uppercase">Legal name</dt>
              <dd className="mt-1 font-semibold text-navy-900">{siteConfig.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-wider text-muted uppercase">GSTIN</dt>
              <dd className="mt-1 font-mono font-semibold text-navy-900">{siteConfig.gstNumber}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-wider text-muted uppercase">Office</dt>
              <dd className="mt-1 text-navy-900">PM Palem, Visakhapatnam, Andhra Pradesh 530041</dd>
            </div>
          </dl>
        </Container>
      </Section>

      <CTASection
        title="Talk to us about your requirements"
        description="Whether it is a new installation, an AMC or a question about your current equipment, start with a conversation."
        primary={{ label: "Contact our team", href: "/contact" }}
        secondary={{ label: "Request a Quote", href: "/request-a-quote" }}
      />
    </>
  );
}
