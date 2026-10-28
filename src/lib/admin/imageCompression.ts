/**
 * Prepares an admin upload in the browser: decodes almost any image format,
 * resizes it, and re-encodes it as small as practical before it's stored.
 * Re-encoding also strips EXIF metadata such as camera GPS location.
 */

/** Largest file accepted from the computer, before compression. */
export const MAX_INPUT_BYTES = 25 * 1024 * 1024;
/** Upper bound after compression; the storage bucket enforces the same limit. */
export const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;
/** Longest side after resizing. Enough for full-width heroes on high-DPI screens. */
const MAX_SIDE = 1600;
/** Aim for this size; quality and then dimensions are reduced until it fits. */
const TARGET_BYTES = 300 * 1024;
const QUALITY_STEPS = [0.82, 0.74, 0.66, 0.58];
/** Refuse images so large they'd exhaust browser memory while decoding. */
const MAX_PIXELS = 100_000_000;

/** Value for the file input's `accept` attribute. */
export const ACCEPTED_IMAGE_TYPES = "image/*,.heic,.heif,.avif,.webp,.svg";

export type CompressedImage = {
  blob: Blob;
  width: number;
  height: number;
  contentType: string;
  extension: string;
};

type Decoded = {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
};

function isHeic(file: File) {
  return /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

/** Decodes with the browser's own support (JPEG, PNG, WebP, AVIF, GIF, BMP, SVG; HEIC on Safari). */
async function decodeNative(blob: Blob): Promise<Decoded> {
  try {
    const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
    return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
  } catch {
    // Some formats (notably SVG) only decode through an <img> element.
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    try {
      await img.decode();
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
    // SVGs without a size report 0; give them a sensible canvas.
    const width = img.naturalWidth || MAX_SIDE;
    const height = img.naturalHeight || MAX_SIDE;
    return { source: img, width, height, release: () => URL.revokeObjectURL(url) };
  }
}

async function decode(file: File): Promise<Decoded> {
  try {
    return await decodeNative(file);
  } catch {
    if (!isHeic(file)) {
      throw new Error("That image couldn't be read. Try a JPG, PNG, WebP, AVIF or HEIC file.");
    }
  }
  // iPhone HEIC photos outside Safari: convert with a decoder that's only
  // downloaded when it's needed.
  try {
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({ blob: file, toType: "image/png" });
    return await decodeNative(Array.isArray(converted) ? converted[0] : converted);
  } catch {
    throw new Error(
      "That HEIC photo couldn't be converted. Export it as JPEG from the Photos app and try again.",
    );
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

function hasTransparency(context: CanvasRenderingContext2D, width: number, height: number) {
  const { data } = context.getImageData(0, 0, width, height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

function draw(decoded: Decoded, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(decoded.width, decoded.height));
  const width = Math.max(1, Math.round(decoded.width * scale));
  const height = Math.max(1, Math.round(decoded.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("This browser can't process images.");
  context.imageSmoothingQuality = "high";
  context.drawImage(decoded.source, 0, 0, width, height);
  return { canvas, context, width, height };
}

/** Encodes at falling quality until the result fits `TARGET_BYTES`; returns the smallest tried. */
async function encodeSmallest(canvas: HTMLCanvasElement, type: string) {
  let best: Blob | null = null;
  for (const quality of QUALITY_STEPS) {
    const blob = await canvasToBlob(canvas, type, quality);
    if (!blob || blob.type !== type) return null; // format not supported for encoding
    if (!best || blob.size < best.size) best = blob;
    if (blob.size <= TARGET_BYTES) break;
  }
  return best;
}

export async function compressImage(file: File): Promise<CompressedImage> {
  if (!file.type.startsWith("image/") && !isHeic(file)) {
    throw new Error("That file isn't an image.");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error(`That image is over ${MAX_INPUT_BYTES / 1024 / 1024} MB. Choose a smaller one.`);
  }

  const decoded = await decode(file);
  try {
    if (decoded.width * decoded.height > MAX_PIXELS) {
      throw new Error("That image is too large to process. Resize it below 100 megapixels.");
    }

    // Try the full size first, then smaller if it still won't get near the target.
    for (const maxSide of [MAX_SIDE, 1200, 900]) {
      const { canvas, context, width, height } = draw(decoded, maxSide);

      // WebP keeps transparency and compresses best. Browsers that can't
      // encode it fall back to PNG for transparent images, JPEG otherwise.
      let blob = await encodeSmallest(canvas, "image/webp");
      if (!blob) {
        blob = hasTransparency(context, width, height)
          ? await canvasToBlob(canvas, "image/png")
          : await encodeSmallest(canvas, "image/jpeg");
      }
      if (!blob) throw new Error("This browser couldn't compress the image.");

      if (blob.size <= TARGET_BYTES || maxSide === 900) {
        if (blob.size > MAX_OUTPUT_BYTES) {
          throw new Error("That image is still too large after compression. Try a simpler image.");
        }
        const extension = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
        return { blob, width, height, contentType: blob.type, extension };
      }
    }
    throw new Error("That image couldn't be compressed.");
  } finally {
    decoded.release();
  }
}
