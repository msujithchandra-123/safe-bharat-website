import Link from "next/link";
import { Mail, MapPin, Phone, Siren } from "lucide-react";
import { siteConfig } from "@/config/site";
import { DesktopNav } from "@/components/navigation/desktop-nav";
import { MobileNavigation } from "@/components/navigation/mobile-navigation";
import { Logo } from "@/components/ui/logo";
import { ButtonLink, Container } from "@/components/ui/primitives";

export function SiteHeader() {
  const phone = siteConfig.contact.phones[0];
  return (
    <header className="sticky top-0 z-40">
      <div className="hidden bg-navy-900 text-[13px] text-white/80 md:block">
        <Container className="flex h-9 items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <a href={`tel:${phone.tel}`} className="inline-flex items-center gap-1.5 hover:text-white">
              <Phone className="size-3.5" aria-hidden="true" />
              {phone.display}
            </a>
            <a href={`mailto:${siteConfig.contact.email}`} className="inline-flex items-center gap-1.5 hover:text-white">
              <Mail className="size-3.5" aria-hidden="true" />
              {siteConfig.contact.email}
            </a>
            <span className="hidden items-center gap-1.5 lg:inline-flex">
              <MapPin className="size-3.5" aria-hidden="true" />
              PM Palem, Visakhapatnam
            </span>
          </div>
          <p className="inline-flex items-center gap-1.5 font-medium text-white">
            <Siren className="size-3.5 text-brand-red" aria-hidden="true" />
            Fire emergency? Call{" "}
            <a href={`tel:${siteConfig.emergencyNumber}`} className="font-bold underline underline-offset-2">
              {siteConfig.emergencyNumber}
            </a>
          </p>
        </Container>
      </div>
      <div className="border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <Container className="flex h-[4.5rem] items-center justify-between gap-4">
          <Link href="/" aria-label="Safe Bharat home" className="shrink-0 rounded-md">
            <Logo priority />
          </Link>
          <DesktopNav />
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ButtonLink href="/request-a-quote">Request a Quote</ButtonLink>
            </div>
            <MobileNavigation />
          </div>
        </Container>
      </div>
    </header>
  );
}
