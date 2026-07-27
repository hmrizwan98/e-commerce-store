import type { ImageType } from "@/lib/images/presets";

/** Top-level Cloudinary folder per admin image field, per the requested folder layout. */
export const CLOUDINARY_FOLDERS: Record<ImageType, string> = {
  product: "products",
  category: "categories",
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

/** Same `folder/subfolder/timestamp-rand` convention the old Storage path builder used - no extension, Cloudinary infers format from the uploaded bytes. */
export function buildPublicId(folder: string, subfolder: string | undefined): string {
  const base = subfolder ? `${folder}/${subfolder}` : folder;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}/${Date.now()}-${rand}`;
}
