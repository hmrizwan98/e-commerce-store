import type { ImageType } from "@/lib/images/presets";

/** Top-level Cloudinary folder per admin image field, per the requested folder layout. */
export const CLOUDINARY_FOLDERS: Record<ImageType, string> = {
  product: "products",
  category: "categories",
  collection: "collections",
  brand: "brands",
  bannerHero: "hero",
  banner: "banners",
  testimonial: "testimonials",
  page: "pages",
  homepage: "homepage",
  blogPost: "blogs",
  themeLogo: "themes/logo",
  themeFavicon: "themes/favicon",
  themeIcon: "themes/icon",
};

/**
 * Same `folder/subfolder/timestamp-rand` convention the old Storage path builder
 * used - no extension, Cloudinary infers format from the uploaded bytes.
 * `tenantSlug` prefixes every path (e.g. `store-a/products/...`) so tenants
 * never share a Cloudinary folder even though they share one Cloudinary account.
 */
export function buildPublicId(tenantSlug: string, folder: string, subfolder: string | undefined): string {
  // subfolder ultimately comes from client-submitted form data (the upload API
  // route) - strip anything outside the shape a real slug ever takes so a
  // crafted value (path separators, "..") can't escape this tenant's own
  // folder prefix or overwrite another tenant's Cloudinary assets.
  const safeSubfolder = subfolder?.replace(/[^a-zA-Z0-9-]/g, "");
  const base = safeSubfolder ? `${tenantSlug}/${folder}/${safeSubfolder}` : `${tenantSlug}/${folder}`;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}/${Date.now()}-${rand}`;
}
