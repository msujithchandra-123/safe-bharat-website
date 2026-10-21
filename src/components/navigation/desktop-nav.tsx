"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, primaryNav } from "@/config/navigation";
import { cn } from "@/components/ui/primitives";
import { ServicesMenu } from "@/components/navigation/services-menu";

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden xl:block">
      <ul className="flex items-center gap-0.5">
        {primaryNav.map((item) => (
          <li key={item.href}>
            {item.children ? (
              <ServicesMenu item={item} />
            ) : (
              <Link
                href={item.href}
                aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-10 items-center rounded-md px-3 text-[15px] font-semibold transition-colors",
                  "text-navy-900 hover:text-brand-red aria-[current=page]:text-brand-red",
                  "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand-red after:opacity-0 aria-[current=page]:after:opacity-100",
                )}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
