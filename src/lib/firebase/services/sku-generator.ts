import "server-only";
import { isSkuTaken } from "@/lib/firebase/repositories/products";

function slugPrefix(name: string): string {
  return (
    name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 12) || "SKU"
  );
}

/** Slug-derived prefix + short random suffix (same convention already used by
 * buildPublicId() in cloudinary/folders.ts), collision-checked against isSkuTaken() so two
 * products never accidentally share a SKU. Purely a suggestion - admins can still type
 * their own SKU instead. */
export async function generateSku(productName: string, excludeProductId?: string): Promise<string> {
  const prefix = slugPrefix(productName);
  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    const candidate = `${prefix}-${suffix}`;
    if (!(await isSkuTaken(candidate, excludeProductId))) return candidate;
  }
  // Extremely unlikely fallback - timestamp guarantees uniqueness.
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}
