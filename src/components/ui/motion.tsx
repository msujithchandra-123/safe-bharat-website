"use client";

import type { ReactNode } from "react";
import { MotionConfig, motion } from "framer-motion";

/** Honours the operating system's reduced-motion preference for every animation. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/**
 * Subtle fade-up when content scrolls into view. Use only below the fold;
 * a <noscript> rule in the root layout keeps content visible without JS.
 */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={`reveal ${className ?? ""}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
