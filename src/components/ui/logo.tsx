import Image from "next/image";
import { cn } from "@/components/ui/primitives";

/**
 * Horizontal logo built from crops of the official artwork: the shield emblem
 * beside the official wordmark. Both keep their original proportions.
 */
export function Logo({ className, priority = false, compact = false }: { className?: string; priority?: boolean; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/brand/safe-bharat-emblem.png"
        alt=""
        width={320}
        height={381}
        priority={priority}
        className={cn("h-11 w-auto sm:h-12", compact && "h-10 sm:h-10")}
      />
      <Image
        src="/brand/safe-bharat-wordmark.png"
        alt="Safe Bharat Fire and Safety Solutions"
        width={720}
        height={136}
        priority={priority}
        className={cn("h-7 w-auto sm:h-8", compact && "h-6 sm:h-6")}
      />
    </span>
  );
}
