"use client";

import React from "react";
import MinimalCard from "./variants/product-cards/MinimalCard";
import BoldGridCard from "./variants/product-cards/BoldGridCard";
import EditorialCard from "./variants/product-cards/EditorialCard";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";
import type { ProductCardThemeConfig } from "@/lib/theme/theme-types";

export interface ThemeProductCardAdapterProps {
  data: Product;
  productCardSettings?: ProductCardThemeConfig;
  className?: string;
  isLiked?: boolean;
}

export default function ThemeProductCardAdapter({ data, productCardSettings, className = "", isLiked }: ThemeProductCardAdapterProps) {
  switch (productCardSettings?.variant) {
    case "bold-grid":
      return <BoldGridCard data={data} className={className} productCardSettings={productCardSettings} />;
    case "editorial":
      return <EditorialCard data={data} className={className} productCardSettings={productCardSettings} />;
    case "minimal":
      return <MinimalCard data={data} className={className} productCardSettings={productCardSettings} />;
    default:
      return <ProductCard data={data} className={className} isLiked={isLiked} />;
  }
}
