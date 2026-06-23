/**
 * TorqLens — client-side image compression.
 *
 * Before any upload we downscale + re-encode to keep payloads small and fast
 * on mobile networks:
 *   • max dimension 1600 px
 *   • JPEG quality ~0.82
 *   • target under ~1.5 MB (we step quality down if needed)
 *
 * Works on a base64 data URL (from the Capacitor Camera plugin or a file
 * picker) and returns a compressed JPEG data URL.
 */

const MAX_DIMENSION = 1600;
const TARGET_BYTES = 1.5 * 1024 * 1024; // 1.5 MB
const INITIAL_QUALITY = 0.82;
const MIN_QUALITY = 0.5;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read the selected image."));
    img.decoding = "async";
    img.src = src;
  });
}

/** Approximate byte length of a base64 data URL. */
function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  // 4 base64 chars → 3 bytes
  return Math.floor((b64.length * 3) / 4);
}

export interface CompressResult {
  dataUrl: string; // data:image/jpeg;base64,...
  width: number;
  height: number;
  bytes: number;
}

/**
 * Compress a data URL to a mobile-friendly JPEG.
 * Falls back to returning the original if a canvas isn't available.
 */
export async function compressImage(sourceDataUrl: string): Promise<CompressResult> {
  if (typeof document === "undefined") {
    return {
      dataUrl: sourceDataUrl,
      width: 0,
      height: 0,
      bytes: dataUrlBytes(sourceDataUrl),
    };
  }

  const img = await loadImage(sourceDataUrl);

  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return {
      dataUrl: sourceDataUrl,
      width,
      height,
      bytes: dataUrlBytes(sourceDataUrl),
    };
  }
  // White backstop so PNGs with transparency flatten cleanly to JPEG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  let quality = INITIAL_QUALITY;
  let out = canvas.toDataURL("image/jpeg", quality);
  // Step quality down until under target (bounded loop).
  while (dataUrlBytes(out) > TARGET_BYTES && quality > MIN_QUALITY) {
    quality = Math.max(MIN_QUALITY, quality - 0.1);
    out = canvas.toDataURL("image/jpeg", quality);
  }

  return { dataUrl: out, width, height, bytes: dataUrlBytes(out) };
}

/** Make a small square thumbnail data URL for history/favorites storage. */
export async function makeThumbnail(
  sourceDataUrl: string,
  size = 160
): Promise<string> {
  if (typeof document === "undefined") return sourceDataUrl;
  const img = await loadImage(sourceDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return sourceDataUrl;

  // center-crop to square
  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.7);
}

/** Read a File (from <input type=file>) into a data URL. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}
