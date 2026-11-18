import "server-only";
import { cloudinary } from "./server";

/**
 * Private Cloudinary assets (payment proofs). `type: "private"` means the original can't be
 * fetched with a plain delivery URL - only through an API-signed, expiring download link
 * created on the server for an authorised admin. Works on Cloudinary's free plan.
 */
export async function uploadPrivateImage(buffer: Buffer, publicId: string): Promise<{ publicId: string; format: string; bytes: number }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: "image", type: "private", overwrite: false },
      (error, result) => {
        if (error || !result) return reject(new Error("Upload failed"));
        resolve({ publicId: result.public_id, format: result.format, bytes: result.bytes });
      }
    );
    stream.end(buffer);
  });
}

/** Expiring (default 10 minutes) signed link to a private image. */
export function privateImageUrl(publicId: string, format: string, ttlSeconds = 600): string {
  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: "image",
    type: "private",
    expires_at: Math.floor(Date.now() / 1000) + ttlSeconds,
  });
}

export async function deletePrivateImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { type: "private", resource_type: "image" });
  } catch {
    // best-effort cleanup
  }
}
