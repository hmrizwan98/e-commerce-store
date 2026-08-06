import "server-only";
import { uploadBuffer, type CloudinaryUploadResult } from "@/lib/cloudinary/upload";
import { deleteByPublicId } from "@/lib/cloudinary/delete";
import { buildPublicId, CLOUDINARY_FOLDERS } from "@/lib/cloudinary/folders";
import { requireCurrentTenant } from "@/lib/tenant/current";
import type { ImageType } from "./presets";

/** The one function the Admin Panel's image upload UI calls to persist a compressed buffer to Cloudinary. */
export async function uploadImageFile(
  file: Buffer,
  imageType: ImageType,
  subfolder?: string
): Promise<CloudinaryUploadResult> {
  const tenant = await requireCurrentTenant();
  const publicId = buildPublicId(tenant.cloudinaryFolder, CLOUDINARY_FOLDERS[imageType], subfolder);
  return uploadBuffer(file, publicId);
}

export async function deleteImageFile(publicId: string): Promise<void> {
  await deleteByPublicId(publicId);
}
