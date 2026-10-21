"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { EquipmentCategory, EquipmentItem } from "@/types/content";
import { EquipmentCard } from "@/components/cards/cards";
import { cn } from "@/components/ui/primitives";

export function EquipmentCatalogue({ items, categories }: { items: EquipmentItem[]; categories: EquipmentCategory[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const requested = params.get("category");
  const active = categories.some((c) => c.slug === requested) ? requested : null;
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (i) =>
        (!active || i.category === active) &&
        (!q || `${i.name} ${i.summary} ${i.applications.join(" ")}`.toLowerCase().includes(q)),
    );
  }, [items, active, query]);

  const setCategory = (slug: string | null) => {
    router.replace(slug ? `${pathname}?category=${slug}` : pathname, { scroll: false });
  };

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {[{ slug: null, title: "All equipment" }, ...categories].map((c) => (
            <button
              key={c.slug ?? "all"}
              type="button"
              aria-pressed={active === c.slug}
              onClick={() => setCategory(c.slug)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                active === c.slug ? "border-navy-900 bg-navy-900 text-white" : "border-line-strong bg-white text-navy-900 hover:border-navy-900",
              )}
            >
              {c.title}
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:w-72">
          <span className="sr-only">Search equipment</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search equipment"
            className="h-11 w-full rounded-md border border-line-strong bg-white pr-3 pl-9 text-[15px] focus:border-navy-700 focus:outline-2 focus:outline-navy-700/25"
          />
        </label>
      </div>
      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {shown.length} item{shown.length === 1 ? "" : "s"}
      </p>
      {shown.length > 0 ? (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((item) => (
            <li key={item.slug}>
              <EquipmentCard item={item} headingLevel="h2" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-line-strong p-10 text-center text-body">
          No equipment matches your search. Try another term, or{" "}
          <Link href="/contact" className="font-semibold text-navy-900 underline">
            ask our team
          </Link>
          .
        </div>
      )}
    </div>
  );
}
