import Link from "next/link";
import { FileText, MessageCircle, Phone } from "lucide-react";
import { siteConfig, whatsappUrl } from "@/config/site";

/**
 * Desktop: a single floating shortcut (WhatsApp when a verified number is
 * configured, otherwise phone) stacked above the chat launcher.
 * Mobile: a persistent bottom action bar (Call · WhatsApp · Quote).
 */
export function FloatingContactButton() {
  const wa = whatsappUrl("Hello Safe Bharat, I would like to discuss a fire safety requirement.");
  const phone = siteConfig.contact.phones[0];
  return wa ? (
    <a
      href={wa}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-6 bottom-24 z-30 hidden size-12 place-items-center rounded-full bg-[#1f8f4e] text-white shadow-raised transition-transform hover:scale-105 md:grid"
      aria-label="Chat with Safe Bharat on WhatsApp (opens in a new tab)"
    >
      <MessageCircle className="size-6" aria-hidden="true" />
    </a>
  ) : (
    <a
      href={`tel:${phone.tel}`}
      className="fixed right-6 bottom-24 z-30 hidden size-12 place-items-center rounded-full border border-line bg-white text-navy-900 shadow-raised transition-transform hover:scale-105 hover:text-brand-red md:grid"
      aria-label={`Call Safe Bharat on ${phone.display}`}
    >
      <Phone className="size-5" aria-hidden="true" />
    </a>
  );
}

export function MobileActionBar() {
  const wa = whatsappUrl("Hello Safe Bharat, I would like to discuss a fire safety requirement.");
  const phone = siteConfig.contact.phones[0];
  const item = "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold";
  return (
    <nav aria-label="Quick contact" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex h-14 items-stretch">
        <a href={`tel:${phone.tel}`} className={`${item} text-navy-900`}>
          <Phone className="size-5" aria-hidden="true" />
          Call
        </a>
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className={`${item} text-[#1f7a45]`}>
            <MessageCircle className="size-5" aria-hidden="true" />
            WhatsApp
          </a>
        ) : null}
        <Link href="/request-a-quote" className={`${item} bg-brand-red text-white`}>
          <FileText className="size-5" aria-hidden="true" />
          Get a Quote
        </Link>
      </div>
    </nav>
  );
}
