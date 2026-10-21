import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function Container({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props}>
      {children}
    </div>
  );
}

type Variant = "primary" | "secondary" | "outline" | "ghost" | "inverse" | "outline-inverse";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand-red text-white hover:bg-brand-red-dark shadow-sm",
  secondary: "bg-navy-900 text-white hover:bg-navy-800 shadow-sm",
  outline: "border border-line-strong bg-white text-navy-900 hover:border-navy-900 hover:bg-navy-50",
  ghost: "text-navy-900 hover:bg-navy-50",
  inverse: "bg-white text-navy-900 hover:bg-navy-50",
  "outline-inverse": "border border-white/40 text-white hover:bg-white/10 hover:border-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-6 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  arrow,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { href: string; variant?: Variant; size?: Size; arrow?: boolean }) {
  const external = /^(https?:|tel:|mailto:)/.test(href);
  const content = (
    <>
      {children}
      {arrow ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
    </>
  );
  if (external) {
    return (
      <a
        href={href}
        className={buttonClasses(variant, size, className)}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...(props as ComponentProps<"a">)}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} {...props}>
      {content}
    </Link>
  );
}

export function Button({ variant, size, className, ...props }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type="button" className={buttonClasses(variant, size, className)} {...props} />;
}

export function Eyebrow({ children, className, tone = "red" }: { children: ReactNode; className?: string; tone?: "red" | "light" }) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 text-xs font-bold tracking-[0.16em] uppercase",
        tone === "red" ? "text-brand-red" : "text-white/75",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("h-0.5 w-6 rounded-full", tone === "red" ? "bg-brand-red" : "bg-brand-red")} />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  as: As = "h2",
  className,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  as?: "h1" | "h2" | "h3";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <Eyebrow tone={tone === "light" ? "light" : "red"} className={cn("mb-4", align === "center" && "justify-center")}>
            {eyebrow}
          </Eyebrow>
        ) : null}
        <As className={cn("text-3xl font-extrabold sm:text-4xl", tone === "light" && "text-white")}>{title}</As>
        {description ? (
          <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", tone === "light" ? "text-white/75" : "text-body")}>{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Section({
  children,
  className,
  tone = "white",
  id,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  tone?: "white" | "mist" | "navy";
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "py-16 sm:py-20 lg:py-24",
        tone === "mist" && "bg-mist",
        tone === "navy" && "bg-blueprint relative bg-navy-900 text-white",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CheckList({ items, tone = "dark", className }: { items: string[]; tone?: "dark" | "light"; className?: string }) {
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "mt-1 grid size-5 shrink-0 place-items-center rounded-full",
              tone === "light" ? "bg-white/10 text-white" : "bg-brand-red-50 text-brand-red",
            )}
          >
            <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3.5 8.5 3 3 6-7" />
            </svg>
          </span>
          <span className={cn("leading-relaxed", tone === "light" ? "text-white/85" : "text-body")}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
