import type { Product } from "@/types/product";
import type { ProductCardThemeConfig } from "@/lib/theme/theme-types";

export interface ProductCardVariantProps {
  data: Product;
  className?: string;
  productCardSettings?: ProductCardThemeConfig;
}

const ASPECT_CLASS: Record<NonNullable<ProductCardThemeConfig["aspectRatio"]>, string> = {
  "1:1": "aspect-square",
  "3:4": "aspect-[3/4]",
  "4:5": "aspect-[4/5]",
  "4:3": "aspect-[4/3]",
};

export function aspectRatioClass(aspectRatio: ProductCardThemeConfig["aspectRatio"] | undefined, fallback: ProductCardThemeConfig["aspectRatio"] = "1:1"): string {
  return ASPECT_CLASS[aspectRatio ?? fallback];
}
