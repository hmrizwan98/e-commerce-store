import "server-only";
import { cloudinary } from "./server";

/** Best-effort: a failed delete must never block the Firestore write that already succeeded. */
export async function deleteByPublicId(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // swallow - orphaned Cloudinary assets are a lesser problem than blocking the caller
  }
}

/**
 * Deletes every Cloudinary asset whose public_id starts with `prefix` - used by store
 * deletion, since every upload's public_id is `{tenantSlug}/...` (see buildPublicId() in
 * folders.ts), so a store's own prefix (`{tenantSlug}/`) catches everything it ever
 * uploaded regardless of which asset-type subfolder. Unlike deleteByPublicId(), this does
 * NOT swallow errors - the caller (deleteStore) needs to know whether this step actually
 * succeeded to report it as a warning rather than silently leaving orphaned assets.
 */
export async function deleteAllByPrefix(prefix: string): Promise<{ deleted: number }> {
  const result = await cloudinary.api.delete_resources_by_prefix(prefix);
  return { deleted: Object.keys(result?.deleted ?? {}).length };
}
