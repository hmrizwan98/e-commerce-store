"use server";

import { deleteImagesByUrls } from "./cleanup";
import { requireAdmin } from "@/lib/firebase/require-admin";

/**
 * Called by ImageUploader when the admin removes a file that was uploaded
 * this session but never persisted to a Firestore doc (e.g. uploaded then
 * immediately un-selected before hitting Save) - that file is guaranteed
 * orphaned regardless of what happens to the rest of the form, so it's safe
 * to delete right away. Images that were already persisted are left alone
 * here; their cleanup is deferred to the update action's old-vs-new diff so
 * cancelling an edit never deletes a still-live image.
 */
export async function deleteUploadedImageAction(url: string): Promise<void> {
  await requireAdmin();
  await deleteImagesByUrls([url]);
}
