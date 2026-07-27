import { CLOUDINARY_CLOUD_NAME } from "./client";

/** Cloudinary delivery URLs for this project's cloud only - never the placeholder or a hand-pasted external URL. */
export function isCloudinaryUrl(url: string | undefined | null): url is string {
  if (!url) return false;
  return url.includes(`res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/`);
}

/**
 * Reverses a Cloudinary secure_url (`.../upload/[transform/][v<version>/]<public_id>.<ext>`)
 * back into its public_id, so deletes can target the same asset. Returns null for anything
 * that isn't that shape - callers should skip deletion in that case rather than throw.
 */
export function extractPublicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:[a-z]_[^/]+\/)*(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  if (!match) return null;
  return match[1];
}
