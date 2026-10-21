import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { EquipmentItem, Industry, Project, Resource, Service } from "@/types/content";
import { getEquipmentCategory } from "@/content/equipment";
import { equipmentItemImages, industryImages, resourceImages, serviceImages, type SiteImage as SiteImageData } from "@/content/images";
import { Icon, type IconName } from "@/components/ui/icon";
import { SiteImage } from "@/components/ui/site-image";
import { cn } from "@/components/ui/primitives";

const cardShell =
  "group relative flex h-full flex-col rounded-xl border border-line bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-100 hover:shadow-raised";
const cardBase = `${cardShell} p-6`;

/** Makes the whole card clickable while keeping a single, labelled link. */
function StretchedLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-brand-red">
      {children}
    </Link>
  );
}

const CARD_SIZES = "(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw";

/** Photo header shared by service, industry and resource cards. Decorative: the card title follows. */
function CardMedia({ image, icon, tone = "navy" }: { image: SiteImageData | undefined; icon: IconName; tone?: "navy" | "red" }) {
  return (
    <div className="relative">
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl bg-navy-50">
        <SiteImage image={image} sizes={CARD_SIZES} decorative fallbackIcon={icon} className="transition-transform duration-500 group-hover:scale-[1.04]" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-950/55 via-navy-950/0 to-transparent" />
      </div>
      <span
        aria-hidden="true"
        className={cn(
          "absolute bottom-0 left-6 grid size-12 translate-y-1/2 place-items-center rounded-lg shadow-card ring-4 ring-white",
          tone === "navy" ? "bg-navy-900 text-white" : "bg-brand-red text-white",
        )}
      >
        <Icon name={icon} className="size-6" strokeWidth={1.75} />
      </span>
    </div>
  );
}

export function ServiceCard({ service, headingLevel = "h3" }: { service: Service; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className={cardShell}>
      <CardMedia image={serviceImages[service.slug]} icon={service.icon} />
      <div className="flex flex-1 flex-col px-6 pt-9 pb-6">
        <H className="text-lg font-bold">
          <StretchedLink href={`/services/${service.slug}`}>{service.title}</StretchedLink>
        </H>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-body">{service.summary}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-red">
          Learn more <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

export function ServiceGrid({ services, headingLevel }: { services: Service[]; headingLevel?: "h2" | "h3" }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => (
        <li key={s.slug}>
          <ServiceCard service={s} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}

export function IndustryCard({ industry, headingLevel = "h3" }: { industry: Industry; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className={cardShell}>
      <CardMedia image={industryImages[industry.slug]} icon={industry.icon} tone="red" />
      <div className="px-6 pt-9 pb-6">
        <H className="text-lg font-bold">
          <StretchedLink href={`/industries/${industry.slug}`}>{industry.title}</StretchedLink>
        </H>
        <p className="mt-2 text-[15px] leading-relaxed text-body">{industry.summary}</p>
      </div>
    </article>
  );
}

export function IndustryGrid({ industries, headingLevel }: { industries: Industry[]; headingLevel?: "h2" | "h3" }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {industries.map((i) => (
        <li key={i.slug}>
          <IndustryCard industry={i} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}

export function EquipmentCard({ item, headingLevel = "h3" }: { item: EquipmentItem; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  const category = getEquipmentCategory(item.category);
  return (
    <article className={cardBase}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-mist">
        <SiteImage
          image={equipmentItemImages[item.slug]}
          sizes="(min-width: 1280px) 18rem, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          decorative
          fallbackIcon={item.icon}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <p className="mt-5 text-xs font-bold tracking-wider text-brand-red uppercase">{category?.title}</p>
      <H className="mt-1.5 text-base font-bold">
        <StretchedLink href={`/equipment/${item.slug}`}>{item.name}</StretchedLink>
      </H>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-body">{item.summary}</p>
      <span className="mt-4 text-sm font-semibold text-navy-900 group-hover:text-brand-red">View details & enquire</span>
    </article>
  );
}

export function ResourceCard({ resource, headingLevel = "h3" }: { resource: Resource; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className={cardShell}>
      <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl bg-navy-50">
        <SiteImage image={resourceImages[resource.slug]} sizes={CARD_SIZES} decorative fallbackIcon="bookOpen" className="transition-transform duration-500 group-hover:scale-[1.04]" />
        <span className="absolute top-4 left-4 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-navy-900 shadow-card">{resource.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted">
          <Clock className="size-3.5" aria-hidden="true" /> {resource.readingMinutes} min read
        </span>
        <H className="mt-3 text-lg font-bold">
          <StretchedLink href={`/resources/${resource.slug}`}>{resource.title}</StretchedLink>
        </H>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-body">{resource.summary}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-red">
          Read guide <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

export function ProjectCard({ project, headingLevel = "h3" }: { project: Project; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  const cover = project.images[0];
  return (
    <article className={cardShell}>
      {cover ? (
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl">
          <Image src={cover.src} alt={cover.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-bold tracking-wider text-brand-red uppercase">{project.category}</p>
        <H className="mt-2 text-lg font-bold">
          <StretchedLink href={`/projects/${project.slug}`}>{project.title}</StretchedLink>
        </H>
        <p className="mt-1 text-sm text-muted">
          {project.industry} · {project.location}
        </p>
        <p className="mt-3 flex-1 text-[15px] leading-relaxed text-body">{project.summary}</p>
      </div>
    </article>
  );
}
