/**
 * Wires up NEXT_PUBLIC_MAX_IMAGE_SIZE_MB / NEXT_PUBLIC_ALLOWED_IMAGE_TYPES
 * (declared in .env.local/.env.example) as the single source of truth for
 * upload validation, shared by the client (fast rejection) and the
 * /api/admin/upload route (authoritative check).
 */
export const ALLOWED_MIME_TYPES = (
  process.env.NEXT_PUBLIC_ALLOWED_IMAGE_TYPES ?? "image/jpeg,image/png,image/webp"
)
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);

export const MAX_ORIGINAL_FILE_SIZE_BYTES =
  Number(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB ?? "10") * 1024 * 1024;

export function isAllowedMimeType(type: string): boolean {
  return ALLOWED_MIME_TYPES.includes(type);
}

export function friendlyMimeList(): string {
  return ALLOWED_MIME_TYPES.map((t) => t.replace("image/", "").toUpperCase()).join(", ");
}
