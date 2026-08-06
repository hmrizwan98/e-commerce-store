/**
 * One entry per admin image field. `folder` is the Storage folder prefix
 * (an optional `subfolder`, e.g. a product/category/brand slug, is appended
 * by storage-path.ts). Quality/size targets follow the pipeline spec:
 * products 150-400KB, banners 300-700KB, brand logos <150KB, category images
 * <250KB, hero slider <700KB. All images share the same 1920px cap and are
 * always re-encoded to WebP.
 */
export interface ImagePreset {
  folder: string;
  maxDimension: number;
  quality: number;
  targetMaxKB?: number;
  targetMinKB?: number;
}

export const IMAGE_PRESETS = {
  product: { folder: "products", maxDimension: 1920, quality: 88, targetMinKB: 150, targetMaxKB: 400 },
  category: { folder: "categories", maxDimension: 1920, quality: 85, targetMaxKB: 250 },
  collection: { folder: "collections", maxDimension: 1920, quality: 85, targetMaxKB: 250 },
  brand: { folder: "brands", maxDimension: 1920, quality: 85, targetMaxKB: 150 },
  bannerHero: { folder: "banners/hero", maxDimension: 1920, quality: 88, targetMaxKB: 700 },
  banner: { folder: "banners", maxDimension: 1920, quality: 88, targetMaxKB: 700 },
  testimonial: { folder: "testimonials", maxDimension: 1920, quality: 85, targetMaxKB: 150 },
  page: { folder: "pages", maxDimension: 1920, quality: 85, targetMaxKB: 400 },
  homepage: { folder: "homepage", maxDimension: 1920, quality: 85, targetMaxKB: 400 },
  blogPost: { folder: "blog", maxDimension: 1920, quality: 85, targetMaxKB: 300 },
  themeLogo: { folder: "theme/logo", maxDimension: 512, quality: 90, targetMaxKB: 100 },
  themeFavicon: { folder: "theme/favicon", maxDimension: 256, quality: 90, targetMaxKB: 50 },
  themeIcon: { folder: "theme/icon", maxDimension: 180, quality: 90, targetMaxKB: 50 },
} as const satisfies Record<string, ImagePreset>;

export type ImageType = keyof typeof IMAGE_PRESETS;

export function isImageType(value: string): value is ImageType {
  return value in IMAGE_PRESETS;
}
