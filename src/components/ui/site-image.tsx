"use client";

import Image from "next/image";
import { useState } from "react";
import type { SiteImage as SiteImageData } from "@/content/images";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/components/ui/primitives";

/**
 * Cropped photograph that fills its (sized) parent. If the image is missing
 * or fails to load, a branded blueprint panel with an icon is shown instead,
 * so there is never a broken-image glyph or an empty box.
 */
export function SiteImage({
  image,
  sizes,
  priority = false,
  fallbackIcon = "shieldCheck",
  className,
  decorative = false,
}: {
  image: SiteImageData | null | undefined;
  sizes: string;
  priority?: boolean;
  fallbackIcon?: IconName;
  className?: string;
  /** Empty alt text when the image only repeats adjacent text. */
  decorative?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!image || failed) {
    return (
      <div aria-hidden="true" className={cn("bg-blueprint-light absolute inset-0 grid place-items-center bg-navy-50", className)}>
        <Icon name={fallbackIcon} className="size-12 text-navy-900/70" strokeWidth={1.4} />
      </div>
    );
  }
  return (
    <Image
      src={image.src}
      alt={decorative ? "" : image.alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
      style={{ objectPosition: image.position ?? "center" }}
    />
  );
}
