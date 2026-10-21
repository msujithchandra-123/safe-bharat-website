import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import sharp from "sharp";
import { equipmentCategories } from "@/content/equipment";
import { allSiteImages, equipmentCategoryImages, equipmentItemImages, industryImages, resourceImages, serviceImages } from "@/content/images";
import { equipment } from "@/content/equipment";
import { industries } from "@/content/industries";
import { resources } from "@/content/resources";
import { services } from "@/content/services";
import { SiteImage } from "@/components/ui/site-image";

const root = path.resolve(import.meta.dirname, "../..");
const publicDir = path.join(root, "public");

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

describe("image registry", () => {
  it("every registered image exists on disk with the declared dimensions", async () => {
    for (const image of allSiteImages()) {
      const file = path.join(publicDir, image.src);
      expect(fs.existsSync(file), image.src).toBe(true);
      const meta = await sharp(file).metadata();
      expect([meta.width, meta.height], image.src).toEqual([image.width, image.height]);
      // Stock photos are stored as WebP; the owner's banner is kept as the exact uploaded PNG.
      expect(meta.format, image.src).toBe(image.src.endsWith(".png") ? "png" : "webp");
    }
  });

  it("every service, industry and guide has a photo; every equipment category is covered", () => {
    for (const s of services) expect(serviceImages[s.slug], s.slug).toBeDefined();
    for (const i of industries) expect(industryImages[i.slug], i.slug).toBeDefined();
    for (const r of resources) expect(resourceImages[r.slug], r.slug).toBeDefined();
    for (const c of equipmentCategories) expect(c.slug in equipmentCategoryImages, c.slug).toBe(true);
    // Every product is explicitly decided: a verified photo, or null for the neutral placeholder.
    for (const e of equipment) expect(e.slug in equipmentItemImages, e.slug).toBe(true);
    expect(Object.keys(equipmentItemImages).sort()).toEqual(equipment.map((e) => e.slug).sort());
  });

  it("credits every Creative Commons image with author, source, licence link and changes", () => {
    for (const image of allSiteImages()) {
      if (!image.credit) continue;
      expect(image.credit.author.length, image.src).toBeGreaterThan(2);
      expect(image.credit.sourceUrl, image.src).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      if (image.credit.license.startsWith("CC")) expect(image.credit.licenseUrl, image.src).toMatch(/^https:\/\/creativecommons\.org\/licenses\//);
      expect(image.credit.changes.length).toBeGreaterThan(3);
    }
  });

  it("every equipment product and category has a verified photo (no placeholders left)", () => {
    expect(Object.entries(equipmentItemImages).filter(([, v]) => v === null).map(([k]) => k)).toEqual([]);
    expect(Object.entries(equipmentCategoryImages).filter(([, v]) => v === null).map(([k]) => k)).toEqual([]);
  });

  it("no photograph is reused across sections", () => {
    const srcs = allSiteImages().map((i) => i.src);
    expect(new Set(srcs).size).toBe(srcs.length);
  });

  it("every image has meaningful alt text", () => {
    for (const image of allSiteImages()) expect(image.alt.length, image.src).toBeGreaterThan(15);
  });

  it("every photo is recorded in docs/ASSET_SOURCES.md", () => {
    const manifest = fs.readFileSync(path.join(root, "docs/ASSET_SOURCES.md"), "utf8");
    for (const image of allSiteImages()) expect(manifest, image.src).toContain(`public${image.src}`);
    for (const file of walk(path.join(publicDir, "images"))) {
      const rel = path.relative(root, file).split(path.sep).join("/");
      expect(manifest, rel).toContain(rel);
    }
  });
});

describe("asset references in source code", () => {
  const sources = walk(path.join(root, "src"))
    .filter((f) => /\.(tsx?|css)$/.test(f) && !f.includes(`${path.sep}generated${path.sep}`))
    .map((f) => ({ f, text: fs.readFileSync(f, "utf8") }));

  it("every /images or /brand path referenced in the code exists", () => {
    const refs = new Set<string>();
    for (const { text } of sources) for (const m of text.matchAll(/["'`](\/(?:images|brand)\/[^"'`$]+)["'`]/g)) refs.add(m[1]!);
    expect(refs.size).toBeGreaterThan(3);
    for (const ref of refs) expect(fs.existsSync(path.join(publicDir, ref)), ref).toBe(true);
    // Registry paths are built with a helper; check them too.
    for (const image of allSiteImages()) expect(fs.existsSync(path.join(publicDir, image.src))).toBe(true);
  });

  it("no images are hot-linked from third-party hosts", () => {
    for (const { f, text } of sources) {
      expect(text, f).not.toMatch(/https?:\/\/(images\.unsplash\.com|images\.pexels\.com|[^"'\s]*\.(?:jpe?g|png|webp|avif|gif))/i);
    }
  });
});

describe("SiteImage fallback", () => {
  const image = { src: "/images/missing.webp", width: 10, height: 10, alt: "A test image that fails to load" };

  it("renders the photo with its alt text", () => {
    const { getByAltText } = render(<SiteImage image={image} sizes="100vw" />);
    expect(getByAltText(image.alt)).toBeInTheDocument();
  });

  it("uses empty alt text when decorative", () => {
    const { container } = render(<SiteImage image={image} sizes="100vw" decorative />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("replaces a failed image with a branded placeholder instead of a broken image", () => {
    const { container } = render(<SiteImage image={image} sizes="100vw" />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("shows the placeholder when no licensed photo exists", () => {
    const { container } = render(<SiteImage image={null} sizes="100vw" fallbackIcon="gauge" />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
