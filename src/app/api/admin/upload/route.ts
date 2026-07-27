import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { uploadImageFile } from "@/lib/images/upload-service";
import { compressImage } from "@/lib/images/compress";
import { IMAGE_PRESETS, isImageType } from "@/lib/images/presets";
import { ALLOWED_MIME_TYPES, MAX_ORIGINAL_FILE_SIZE_BYTES, friendlyMimeList } from "@/lib/images/validate";

export const runtime = "nodejs";

/**
 * Replaces the old uploadImageAction Server Action so the client can drive
 * this over XMLHttpRequest and get real xhr.upload.onprogress byte progress
 * (Server Actions don't expose that). Always re-validates and re-compresses
 * with sharp server-side, even though the client already pre-compressed -
 * this is the authoritative pass a bypassed/tampered client can't skip.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const imageType = formData.get("imageType") as string | null;
  const subfolder = (formData.get("subfolder") as string | null) || undefined;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!imageType || !isImageType(imageType)) {
    return NextResponse.json({ error: "Invalid or missing imageType" }, { status: 400 });
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type. Allowed: ${friendlyMimeList()}` },
      { status: 400 }
    );
  }
  if (file.size > MAX_ORIGINAL_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File exceeds ${Math.round(MAX_ORIGINAL_FILE_SIZE_BYTES / (1024 * 1024))}MB max size` },
      { status: 400 }
    );
  }

  const originalBuffer = Buffer.from(await file.arrayBuffer());

  try {
    await sharp(originalBuffer).metadata();
  } catch {
    return NextResponse.json(
      { error: "This file appears to be corrupted or is not a valid image." },
      { status: 400 }
    );
  }

  const preset = IMAGE_PRESETS[imageType];
  const { buffer } = await compressImage(originalBuffer, preset);

  try {
    const result = await uploadImageFile(buffer, imageType, subfolder);
    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
      originalSize: originalBuffer.length,
      optimizedSize: buffer.length,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }
}
