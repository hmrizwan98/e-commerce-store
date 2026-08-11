import React from "react";
import ProductDetailClient, { type ProductDetailClientProps } from "@/app/product/[slug]/ProductDetailClient";
import MinimalProductDetail from "./variants/product-detail/MinimalProductDetail";
import BoldProductDetail from "./variants/product-detail/BoldProductDetail";
import LuxuryProductDetail from "./variants/product-detail/LuxuryProductDetail";
import type { ProductDetailThemeConfig } from "@/lib/theme/theme-types";

export interface ThemeProductDetailAdapterProps extends ProductDetailClientProps {
  productDetailSettings?: ProductDetailThemeConfig;
}

export default function ThemeProductDetailAdapter({ productDetailSettings, ...props }: ThemeProductDetailAdapterProps) {
  switch (productDetailSettings?.variant) {
    case "minimal":
      return <MinimalProductDetail {...props} productDetailSettings={productDetailSettings} />;
    case "bold":
      return <BoldProductDetail {...props} productDetailSettings={productDetailSettings} />;
    case "luxury":
      return <LuxuryProductDetail {...props} productDetailSettings={productDetailSettings} />;
    default:
      return <ProductDetailClient {...props} />;
  }
}
