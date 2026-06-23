/**
 * TorqLens — production-safe iOS icon generator.
 *
 * The design master (public/brand/app-icon-1024-master.png) ships with an
 * ALPHA channel and BAKED ROUNDED CORNERS. The App Store REJECTS icons that
 * contain alpha/transparency, and iOS masks the corners itself — a baked
 * radius double-rounds. This script produces an App-Store-safe icon:
 *
 *   • Fully OPAQUE (alpha flattened onto the brand navy #2b2d42)
 *   • SQUARE with NO rounded corners (corners filled back to navy)
 *   • 1024×1024 master + the full iOS AppIcon asset set
 *
 * Output:
 *   public/brand/app-icon-1024-appstore.png         (opaque, square, no radius)
 *   ios/App/App/Assets.xcassets/AppIcon.appiconset/  (sized PNGs + Contents.json)
 *     — only written if the ios/ project exists (after `cap add ios`)
 *
 * Run: npm run icons   (after `npm install` so `sharp` is available)
 */
import sharp from "sharp";
import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const MASTER = resolve(ROOT, "public/brand/app-icon-1024-master.png");
const NAVY = { r: 0x2b, g: 0x2d, b: 0x42 }; // #2b2d42 — TorqLens brand navy
const APPSTORE_OUT = resolve(ROOT, "public/brand/app-icon-1024-appstore.png");
const APPICONSET = resolve(
  ROOT,
  "ios/App/App/Assets.xcassets/AppIcon.appiconset"
);

// iOS AppIcon sizes (point size × scale = pixel size). Single-size 1024 is
// what modern Xcode (single-size asset) needs, but we also emit the classic
// set so the catalog is valid on older toolchains.
const ICONS = [
  { size: 1024, scale: 1, idiom: "ios-marketing", name: "AppIcon-1024.png" },
  { size: 20, scale: 2, idiom: "iphone", name: "AppIcon-20@2x.png" },
  { size: 20, scale: 3, idiom: "iphone", name: "AppIcon-20@3x.png" },
  { size: 29, scale: 2, idiom: "iphone", name: "AppIcon-29@2x.png" },
  { size: 29, scale: 3, idiom: "iphone", name: "AppIcon-29@3x.png" },
  { size: 40, scale: 2, idiom: "iphone", name: "AppIcon-40@2x.png" },
  { size: 40, scale: 3, idiom: "iphone", name: "AppIcon-40@3x.png" },
  { size: 60, scale: 2, idiom: "iphone", name: "AppIcon-60@2x.png" },
  { size: 60, scale: 3, idiom: "iphone", name: "AppIcon-60@3x.png" },
];

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Flatten the master onto a fully-opaque navy square with no corner radius.
 * Returns a 1024×1024 PNG buffer with NO alpha channel.
 */
async function buildOpaqueSquareMaster() {
  // Composite the (possibly rounded, alpha) master onto a solid navy square.
  // `flatten` removes the alpha channel entirely; `removeAlpha` guarantees
  // a 3-channel (opaque) PNG so App Store validation passes.
  const base = sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { ...NAVY, alpha: 1 },
    },
  });

  const masterResized = await sharp(MASTER)
    .resize(1024, 1024, { fit: "cover" })
    .toBuffer();

  return base
    .composite([{ input: masterResized, left: 0, top: 0 }])
    .flatten({ background: NAVY })
    .removeAlpha()
    .png()
    .toBuffer();
}

async function main() {
  if (!(await exists(MASTER))) {
    console.error(`✗ Missing master icon: ${MASTER}`);
    process.exit(1);
  }

  const opaque = await buildOpaqueSquareMaster();

  // 1) App-Store-safe 1024 master in public/brand
  await writeFile(APPSTORE_OUT, opaque);
  // Verify it really is opaque (no alpha channel).
  const meta = await sharp(opaque).metadata();
  const ok = !meta.hasAlpha && meta.channels === 3;
  console.log(
    `✓ ${APPSTORE_OUT.replace(ROOT + "/", "")} — ${meta.width}×${meta.height}, ` +
      `channels=${meta.channels}, hasAlpha=${meta.hasAlpha} ${ok ? "(OPAQUE ✓)" : "(⚠ STILL HAS ALPHA)"}`
  );
  if (!ok) process.exit(2);

  // 2) iOS asset catalog (only if the native project exists)
  if (!(await exists(resolve(ROOT, "ios")))) {
    console.log(
      "ℹ ios/ not found — run `npx cap add ios` first, then `npm run icons` " +
        "again to populate the AppIcon set."
    );
    return;
  }

  await mkdir(APPICONSET, { recursive: true });
  const images = [];
  for (const { size, scale, idiom, name } of ICONS) {
    const px = size * scale;
    const buf = await sharp(opaque).resize(px, px).removeAlpha().png().toBuffer();
    await writeFile(resolve(APPICONSET, name), buf);
    images.push({
      size: `${size}x${size}`,
      idiom,
      filename: name,
      scale: `${scale}x`,
    });
  }

  const contents = {
    images,
    info: { version: 1, author: "torqlens-icon-generator" },
  };
  await writeFile(
    resolve(APPICONSET, "Contents.json"),
    JSON.stringify(contents, null, 2)
  );
  console.log(
    `✓ Wrote ${images.length} app-icon PNGs + Contents.json to AppIcon.appiconset (all opaque)`
  );
}

main().catch((err) => {
  console.error("Icon generation failed:", err.message);
  process.exit(1);
});
