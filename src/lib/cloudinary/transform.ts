import { isCloudinaryUrl } from "./validation";

const UPLOAD_MARKER = "/upload/";
const OWN_TRANSFORM_PREFIX = "f_auto,q_auto,dpr_auto";

export interface DeliveryOptions {
  width?: number;
  quality?: string;
  format?: string;
  dpr?: string;
}

/**
 * Inserts f_auto,q_auto,dpr_auto(,w_<n>) into a Cloudinary secure_url so the CDN serves a
 * modern format (AVIF/WebP) at perceptual-quality compression instead of the original bytes.
 * No-op for anything that isn't a Cloudinary URL from this project's cloud (local placeholder,
 * legacy pasted-in URLs) and idempotent if a delivery URL is passed in twice.
 */
export function buildDeliveryUrl(url: string, opts: DeliveryOptions = {}): string {
  if (!isCloudinaryUrl(url)) return url;

  const idx = url.indexOf(UPLOAD_MARKER);
  if (idx === -1) return url;

  const afterUpload = url.slice(idx + UPLOAD_MARKER.length);
  if (afterUpload.startsWith(OWN_TRANSFORM_PREFIX)) return url;

  const { width, quality = "auto", format = "auto", dpr = "auto" } = opts;
  const segments = [`f_${format}`, `q_${quality}`, `dpr_${dpr}`];
  if (width) segments.push(`w_${width}`);

  return `${url.slice(0, idx + UPLOAD_MARKER.length)}${segments.join(",")}/${afterUpload}`;
}
