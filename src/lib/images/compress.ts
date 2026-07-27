import "server-only";
import sharp from "sharp";
import type { ImagePreset } from "./presets";

export interface CompressResult {
  buffer: Buffer;
  width: number;
  height: number;
  quality: number;
}

const QUALITY_FLOOR = 60;
const QUALITY_STEP = 5;

/**
 * Authoritative server-side pass: auto-orients from EXIF then strips it,
 * enforces preset.maxDimension without ever upscaling, and re-encodes to
 * WebP - stepping quality down (never below QUALITY_FLOOR) until the output
 * fits preset.targetMaxKB. Runs even when the client already pre-compressed,
 * so a bypassed/tampered client can never skip these guarantees.
 */
export async function compressImage(buffer: Buffer, preset: ImagePreset): Promise<CompressResult> {
  const oriented = sharp(buffer).rotate();
  const pipeline = oriented.resize({
    width: preset.maxDimension,
    height: preset.maxDimension,
    fit: "inside",
    withoutEnlargement: true,
  });

  let quality = preset.quality;
  let output = await pipeline.clone().webp({ quality }).toBuffer();

  while (preset.targetMaxKB && output.length > preset.targetMaxKB * 1024 && quality > QUALITY_FLOOR) {
    quality -= QUALITY_STEP;
    output = await pipeline.clone().webp({ quality }).toBuffer();
  }

  const finalMeta = await sharp(output).metadata();
  return {
    buffer: output,
    width: finalMeta.width ?? 0,
    height: finalMeta.height ?? 0,
    quality,
  };
}
