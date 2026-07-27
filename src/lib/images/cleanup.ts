import "server-only";
import { deleteImageFile } from "./upload-service";
import { extractPublicIdFromUrl, isCloudinaryUrl } from "@/lib/cloudinary/validation";

/**
 * Best-effort orphan cleanup: skips placeholder/non-Cloudinary URLs, and never
 * throws (a failed delete must not block the Firestore write that already
 * succeeded). Used by every update/delete action that replaces or removes an
 * image field.
 */
export async function deleteImagesByUrls(urls: (string | undefined | null)[]): Promise<void> {
  const publicIds = urls
    .filter(isCloudinaryUrl)
    .map(extractPublicIdFromUrl)
    .filter((id): id is string => id !== null);

  if (!publicIds.length) return;
  await Promise.allSettled(publicIds.map((id) => deleteImageFile(id)));
}

/** Set-difference by value: URLs present in `oldUrls` but not in `newUrls`. */
export function diffRemovedImages(
  oldUrls: (string | undefined | null)[],
  newUrls: (string | undefined | null)[]
): string[] {
  const next = new Set(newUrls.filter(Boolean) as string[]);
  return (oldUrls.filter(Boolean) as string[]).filter((url) => !next.has(url));
}
