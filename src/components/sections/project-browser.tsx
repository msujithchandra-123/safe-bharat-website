"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/types/content";
import { ProjectCard } from "@/components/cards/cards";
import { cn } from "@/components/ui/primitives";

/** Project grid with category filters. Filters only appear when there is something to filter. */
export function ProjectBrowser({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => [...new Set(projects.map((p) => p.category))], [projects]);
  const [active, setActive] = useState<string | null>(null);
  const shown = active ? projects.filter((p) => p.category === active) : projects;

  return (
    <div>
      {categories.length > 1 ? (
        <div role="group" aria-label="Filter projects by category" className="mb-8 flex flex-wrap gap-2">
          {[null, ...categories].map((c) => (
            <button
              key={c ?? "all"}
              type="button"
              aria-pressed={active === c}
              onClick={() => setActive(c)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                active === c ? "border-navy-900 bg-navy-900 text-white" : "border-line-strong bg-white text-navy-900 hover:border-navy-900",
              )}
            >
              {c ?? "All projects"}
            </button>
          ))}
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {shown.length} project{shown.length === 1 ? "" : "s"} shown
      </p>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <li key={p.slug}>
            <ProjectCard project={p} headingLevel="h2" />
          </li>
        ))}
      </ul>
    </div>
  );
}
