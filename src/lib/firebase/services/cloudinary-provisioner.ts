import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary/folders";

/**
 * Records (metadata only - no Cloudinary API call, no file upload) the 7 asset-category
 * folder paths this store is provisioned for. Cloudinary itself creates folders implicitly
 * on first real upload, so this doc exists purely so the architecture has an explicit,
 * queryable record of "this store's asset folders are reserved" ahead of any real upload.
 * Reuses CLOUDINARY_FOLDERS (src/lib/cloudinary/folders.ts) wherever a category already
 * maps to an existing admin image field, instead of duplicating those folder names.
 */
export async function provisionCloudinaryMetadata(
  storeDocRef: FirebaseFirestore.DocumentReference,
  tenantSlug: string
): Promise<void> {
  const folders = {
    products: `${tenantSlug}/${CLOUDINARY_FOLDERS.product}`,
    categories: `${tenantSlug}/${CLOUDINARY_FOLDERS.category}`,
    cms: `${tenantSlug}/${CLOUDINARY_FOLDERS.page}`,
    banners: `${tenantSlug}/${CLOUDINARY_FOLDERS.banner}`,
    brands: `${tenantSlug}/${CLOUDINARY_FOLDERS.brand}`,
    logos: `${tenantSlug}/${CLOUDINARY_FOLDERS.themeLogo}`,
    gallery: `${tenantSlug}/gallery`,
  };

  await storeDocRef
    .collection("cloudinaryProvisioning")
    .doc("status")
    .set({ folders, provisionedAt: FieldValue.serverTimestamp() });
}
