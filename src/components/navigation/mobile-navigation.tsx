"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Mail, Menu, Phone, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { isActivePath, primaryNav } from "@/config/navigation";
import { buttonClasses, cn } from "@/components/ui/primitives";

/** Slide-in navigation drawer for screens narrower than the desktop breakpoint. */
export function MobileNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // false during SSR and hydration, true afterwards: the portal never causes a hydration mismatch.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  // Close on navigation (state adjusted during render, as recommended by React).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useLayoutEffect(() => () => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () =>
      Array.from(panelRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []).filter((el) => el.offsetParent !== null);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="grid size-11 place-items-center rounded-md border border-line text-navy-900 hover:bg-mist"
      >
        {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
      </button>

      {/* Portalled to <body>: the header's backdrop-filter would otherwise become the
          containing block for this fixed-position drawer and clip it. */}
      {mounted
        ? createPortal(
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-navy-950/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="panel"
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              className="fixed inset-y-0 right-0 z-50 flex w-[min(24rem,100vw)] flex-col bg-white shadow-raised"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <span className="font-heading text-sm font-bold tracking-wide text-navy-900 uppercase">Menu</span>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  aria-label="Close menu"
                  className="grid size-10 place-items-center rounded-md hover:bg-mist"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-3">
                <ul className="space-y-0.5">
                  <li>
                    <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={linkClass}>
                      Home
                    </Link>
                  </li>
                  {primaryNav.map((item) =>
                    item.children ? (
                      <li key={item.href}>
                        <button
                          type="button"
                          aria-expanded={servicesOpen}
                          onClick={() => setServicesOpen((v) => !v)}
                          className={cn(linkClass, "w-full justify-between", isActivePath(pathname, item.href) && "text-brand-red")}
                        >
                          {item.label}
                          <ChevronDown className={cn("size-4 transition-transform", servicesOpen && "rotate-180")} aria-hidden="true" />
                        </button>
                        {servicesOpen ? (
                          <ul className="mb-2 ml-3 border-l border-line pl-3">
                            <li>
                              <Link href={item.href} className={subLinkClass} aria-current={pathname === item.href ? "page" : undefined}>
                                All services
                              </Link>
                            </li>
                            {item.children.map((child) => (
                              <li key={child.href}>
                                <Link href={child.href} className={subLinkClass} aria-current={pathname === child.href ? "page" : undefined}>
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ) : (
                      <li key={item.href}>
                        <Link href={item.href} aria-current={isActivePath(pathname, item.href) ? "page" : undefined} className={linkClass}>
                          {item.label}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </nav>

              <div className="space-y-3 border-t border-line p-5">
                <Link href="/request-a-quote" className={buttonClasses("primary", "md", "w-full")}>
                  Request a Quote
                </Link>
                <Link href="/request-an-amc" className={buttonClasses("outline", "md", "w-full")}>
                  Request an AMC
                </Link>
                <div className="space-y-2 pt-2 text-sm text-body">
                  <a href={`tel:${siteConfig.contact.phones[0].tel}`} className="flex items-center gap-2 hover:text-brand-red">
                    <Phone className="size-4" aria-hidden="true" /> {siteConfig.contact.phones[0].display}
                  </a>
                  <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-2 break-all hover:text-brand-red">
                    <Mail className="size-4" aria-hidden="true" /> {siteConfig.contact.email}
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}

const noopSubscribe = () => () => {};

const linkClass =
  "flex items-center rounded-md px-3 py-3 text-base font-semibold text-navy-900 hover:bg-mist aria-[current=page]:bg-navy-50 aria-[current=page]:text-brand-red";
const subLinkClass = "block rounded-md px-3 py-2 text-sm text-body hover:bg-mist hover:text-navy-900 aria-[current=page]:font-semibold aria-[current=page]:text-brand-red";
