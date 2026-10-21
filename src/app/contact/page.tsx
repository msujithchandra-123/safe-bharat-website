import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone, Siren } from "lucide-react";
import { formatAddress, mapsUrl, siteConfig, whatsappUrl } from "@/config/site";
import { ContactForm } from "@/components/forms/enquiry-forms";
import { PageHero } from "@/components/sections/sections";
import { ButtonLink, Container, Section } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact Us: PM Palem, Visakhapatnam",
  description: `Contact Safe Bharat Fire and Safety Solutions, PM Palem, Visakhapatnam. Call ${siteConfig.contact.phones[0].display} or email ${siteConfig.contact.email}.`,
  path: "/contact",
});

export default function ContactPage() {
  const wa = whatsappUrl("Hello Safe Bharat, I would like to discuss a fire safety requirement.");
  const mapQuery = encodeURIComponent(`M K Prestige, Near Sivalayam, PM Palem, Visakhapatnam, Andhra Pradesh 530041`);
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to Safe Bharat"
        intro="Questions, site visits, quotations or maintenance: send us a message or reach us directly."
        breadcrumbs={[{ label: "Contact", href: "/contact" }]}
      />
      <Section>
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-extrabold">Send us a message</h2>
            <p className="mt-2 mb-8 text-body">
              For a structured quotation, use{" "}
              <Link href="/request-a-quote" className="font-semibold text-navy-900 underline underline-offset-2">
                Request a Quote
              </Link>
              . For maintenance contracts, use{" "}
              <Link href="/request-an-amc" className="font-semibold text-navy-900 underline underline-offset-2">
                Request an AMC
              </Link>
              .
            </p>
            <ContactForm />
          </div>
          <aside className="space-y-5 lg:col-span-5" aria-label="Contact details">
            <div className="rounded-2xl bg-navy-900 p-7 text-white">
              <h2 className="text-xl font-extrabold text-white">Contact details</h2>
              <ul className="mt-6 space-y-5">
                {siteConfig.contact.phones.map((p) => (
                  <li key={p.tel} className="flex gap-4">
                    <Phone className="mt-0.5 size-5 shrink-0 text-brand-red" aria-hidden="true" />
                    <a href={`tel:${p.tel}`} className="font-semibold hover:underline">
                      {p.display}
                    </a>
                  </li>
                ))}
                <li className="flex gap-4">
                  <Mail className="mt-0.5 size-5 shrink-0 text-brand-red" aria-hidden="true" />
                  <a href={`mailto:${siteConfig.contact.email}`} className="font-semibold break-all hover:underline">
                    {siteConfig.contact.email}
                  </a>
                </li>
                <li className="flex gap-4">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-brand-red" aria-hidden="true" />
                  <address className="leading-relaxed not-italic text-white/85">{formatAddress()}</address>
                </li>
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                {wa ? (
                  <ButtonLink href={wa} variant="inverse" size="sm">
                    <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
                  </ButtonLink>
                ) : null}
                <ButtonLink href={mapsUrl()} variant="outline-inverse" size="sm">
                  <MapPin className="size-4" aria-hidden="true" /> Open in Google Maps
                </ButtonLink>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-line">
              <iframe
                title="Map showing the Safe Bharat office in PM Palem, Visakhapatnam"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full border-0"
              />
            </div>
            <p className="flex gap-3 rounded-xl border border-brand-red/30 bg-brand-red-50 p-5 text-sm leading-relaxed text-ink">
              <Siren className="mt-0.5 size-5 shrink-0 text-brand-red" aria-hidden="true" />
              <span>
                <strong>In a fire emergency, call 112.</strong> Raise the alarm and evacuate if it is not safe to stay. This contact form is not
                monitored for emergencies.
              </span>
            </p>
            <p className="text-xs text-muted">GSTIN {siteConfig.gstNumber}</p>
          </aside>
        </Container>
      </Section>
    </>
  );
}
