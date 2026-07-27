import { PLACEHOLDER_IMAGE_URL } from "@/lib/images/config";
import { isCloudinaryUrl } from "@/lib/cloudinary/validation";
import { buildDeliveryUrl, type DeliveryOptions } from "@/lib/cloudinary/transform";

/**
 * Falls back to the bundled placeholder instead of ever passing an empty/undefined
 * src to next/image, and runs Cloudinary-hosted images through f_auto,q_auto,dpr_auto
 * (plus an optional width hint) so the CDN serves a modern, size-appropriate format
 * instead of the original bytes. Non-Cloudinary URLs (legacy pasted-in URLs) pass through unchanged.
 */
export function safeImageSrc(src?: string | null, opts?: DeliveryOptions): string {
  if (!src || src.trim() === "") return PLACEHOLDER_IMAGE_URL;
  return isCloudinaryUrl(src) ? buildDeliveryUrl(src, opts) : src;
}
