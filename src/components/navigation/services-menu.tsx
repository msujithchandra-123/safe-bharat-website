"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { isActivePath, type NavItem } from "@/config/navigation";
import { cn } from "@/components/ui/primitives";

/** Desktop "Services" disclosure menu: click or keyboard to open, Esc or outside click to close. */
export function ServicesMenu({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOpenedAt = useRef(0);
  const active = isActivePath(pathname, item.href);

  // Close on navigation (state adjusted during render, as recommended by React).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  // Transient UI: never restore an open menu when a hidden route becomes visible again.
  useLayoutEffect(() => () => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen((wasOpen) => {
      if (!wasOpen) hoverOpenedAt.current = Date.now();
      return true;
    });
  };
  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && openNow()}
      onPointerLeave={(e) => e.pointerType === "mouse" && closeSoon()}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          // A click right after hover-to-open should not immediately close the menu again.
          if (Date.now() - hoverOpenedAt.current < 500) {
            setOpen(true);
            return;
          }
          setOpen((v) => !v);
        }}
        className={cn(
          "inline-flex h-10 items-center gap-1 rounded-md px-3 text-[15px] font-semibold transition-colors",
          active ? "text-brand-red" : "text-navy-900 hover:text-brand-red",
        )}
      >
        {item.label}
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      <div
        id={menuId}
        hidden={!open}
        className="absolute top-full left-1/2 z-50 w-[min(860px,calc(100vw-2rem))] -translate-x-1/2 pt-3"
      >
        <div className="rounded-xl border border-line bg-white p-3 shadow-raised">
          <ul className="grid grid-cols-3 gap-1">
            {item.children?.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onNavigate={() => setOpen(false)}
                  aria-current={pathname === child.href ? "page" : undefined}
                  className="group block h-full rounded-lg p-3 transition-colors hover:bg-mist aria-[current=page]:bg-navy-50"
                >
                  <span className="block text-sm font-bold text-navy-900 group-hover:text-brand-red">{child.label}</span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted">{child.description}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-navy-900 px-4 py-3 text-sm text-white">
            <span>Not sure what you need? We can assess your site first.</span>
            <Link href="/services" onNavigate={() => setOpen(false)} className="font-semibold underline-offset-4 hover:underline">
              View all services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
