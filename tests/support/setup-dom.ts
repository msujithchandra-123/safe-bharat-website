import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { createElement, type ImgHTMLAttributes } from "react";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// jsdom lacks these browser APIs used by framer-motion and the chat panel.
class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
Object.defineProperty(globalThis, "IntersectionObserver", { value: IO, writable: true });
// Server-side test files opt into `@vitest-environment node`, where there is no DOM to patch.
if (typeof window !== "undefined") {
  Element.prototype.scrollTo = function scrollTo() {};
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      value: (query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
    });
  }
}

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; fetchPriority?: string }) => {
    const imgProps: Record<string, unknown> = { ...props };
    delete imgProps.priority;
    delete imgProps.fetchPriority;
    return createElement("img", imgProps);
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
