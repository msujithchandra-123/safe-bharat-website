// Derives web-ready brand assets from the official Safe Bharat source files.
// Only crops and resizes are applied; the artwork itself is never redrawn or recoloured.
//
// Usage: node scripts/prepare-brand-assets.mjs "<path to logo png>" "<path to banner jpg>"
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";

const [logoSource, bannerSource] = process.argv.slice(2);
if (!logoSource || !bannerSource) {
  console.error("Usage: node scripts/prepare-brand-assets.mjs <logo.png> <banner.jpg>");
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const brandDir = path.join(root, "public", "brand");
const imageDir = path.join(root, "public", "images");
const appDir = path.join(root, "src", "app");
await fs.mkdir(brandDir, { recursive: true });
await fs.mkdir(imageDir, { recursive: true });

// Regions measured on the 1254x1254 official logo.
const LOGO_REGIONS = {
  emblem: { left: 300, top: 22, width: 655, height: 780 },
  wordmark: { left: 62, top: 806, width: 1132, height: 214 },
  lockup: { left: 58, top: 18, width: 1140, height: 1004 },
};

async function crop(source, region, out, width, format = "png") {
  let pipeline = sharp(source).extract(region).resize({ width, withoutEnlargement: true });
  pipeline = format === "png" ? pipeline.png({ compressionLevel: 9 }) : pipeline.webp({ quality: 88 });
  await pipeline.toFile(out);
  console.log("wrote", path.relative(root, out));
}

await crop(logoSource, LOGO_REGIONS.emblem, path.join(brandDir, "safe-bharat-emblem.png"), 320);
await crop(logoSource, LOGO_REGIONS.wordmark, path.join(brandDir, "safe-bharat-wordmark.png"), 720);
await crop(logoSource, LOGO_REGIONS.lockup, path.join(brandDir, "safe-bharat-lockup.png"), 720);

await sharp(logoSource).resize({ width: 960 }).png({ compressionLevel: 9 }).toFile(path.join(brandDir, "safe-bharat-logo-full.png"));
console.log("wrote public/brand/safe-bharat-logo-full.png");

// Favicons: the emblem centred on a white square.
async function squareIcon(size, out) {
  const inner = Math.round(size * 0.86);
  const emblem = await sharp(logoSource).extract(LOGO_REGIONS.emblem).resize({ height: inner, width: inner, fit: "contain", background: "#ffffff" }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 3, background: "#ffffff" } })
    .composite([{ input: emblem, gravity: "center" }])
    .png()
    .toFile(out);
  console.log("wrote", path.relative(root, out));
}
await squareIcon(512, path.join(appDir, "icon.png"));
await squareIcon(180, path.join(appDir, "apple-icon.png"));

// Open Graph card: official lockup on white, navy base rule in the brand colour.
{
  const lockup = await sharp(logoSource).extract(LOGO_REGIONS.lockup).resize({ height: 520 }).toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#ffffff" } })
    .composite([
      { input: lockup, top: 40, left: Math.round((1200 - (await sharp(lockup).metadata()).width) / 2) },
      { input: { create: { width: 1200, height: 18, channels: 3, background: "#071B3B" } }, top: 612, left: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(appDir, "opengraph-image.png"));
  console.log("wrote src/app/opengraph-image.png");
}

// Banner: the full brochure image, plus the photographic panel on its right-hand side.
await sharp(bannerSource).webp({ quality: 86 }).toFile(path.join(imageDir, "safe-bharat-banner.webp"));
console.log("wrote public/images/safe-bharat-banner.webp");
await sharp(bannerSource)
  .extract({ left: 940, top: 96, width: 596, height: 559 })
  .webp({ quality: 88 })
  .toFile(path.join(imageDir, "hero-industrial-equipment.webp"));
console.log("wrote public/images/hero-industrial-equipment.webp");
