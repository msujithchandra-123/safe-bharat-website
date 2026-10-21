import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { absoluteUrl } from "@/config/site";
import { JsonLd } from "@/components/seo/json-ld";
import { cn } from "@/components/ui/primitives";

export interface Crumb {
  label: string;
  href: string;
}

export function Breadcrumbs({ items, tone = "light", className }: { items: Crumb[]; tone?: "light" | "dark"; className?: string }) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className={className}>
        <ol className={cn("flex flex-wrap items-center gap-1.5 text-sm", tone === "light" ? "text-white/70" : "text-muted")}>
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-1.5">
                {i > 0 ? <ChevronRight className="size-3.5 opacity-60" aria-hidden="true" /> : null}
                {last ? (
                  <span aria-current="page" className={tone === "light" ? "font-medium text-white" : "font-medium text-ink"}>
                    {c.label}
                  </span>
                ) : (
                  <Link href={c.href} className={tone === "light" ? "hover:text-white" : "hover:text-navy-900"}>
                    {c.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: absoluteUrl(c.href) })),
        }}
      />
    </>
  );
}
