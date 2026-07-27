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
