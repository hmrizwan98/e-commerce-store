"use client";

import React from "react";
import MinimalCard from "./variants/product-cards/MinimalCard";
import BoldGridCard from "./variants/product-cards/BoldGridCard";
import EditorialCard from "./variants/product-cards/EditorialCard";
import DealCard from "./variants/product-cards/DealCard";
import TrendGlassCard from "./variants/product-cards/TrendGlassCard";
import SleekPillCard from "./variants/product-cards/SleekPillCard";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";
import type { ProductCardThemeConfig } from "@/lib/theme/theme-types";

export interface ThemeProductCardAdapterProps {
  data: Product;
  productCardSettings?: ProductCardThemeConfig;
  className?: string;
  isLiked?: boolean;
}

export default function ThemeProductCardAdapter(props: ThemeProductCardAdapterProps) {
  // Layout-neutral wrapper (display: contents) so the theme's "Apply card style to product
  // cards" option can style the card root via CSS - see .theme-card-slot in globals.css.
  return <div className="theme-card-slot">{renderCard(props)}</div>;
}

function renderCard({ data, productCardSettings, className = "", isLiked }: ThemeProductCardAdapterProps) {
  switch (productCardSettings?.variant) {
    case "sleek-pill":
    case "sleek":
      return <SleekPillCard data={data} className={className} productCardSettings={productCardSettings} />;
    case "trend-glass":
      return <TrendGlassCard data={data} className={className} productCardSettings={productCardSettings} />;
    case "deal-card":
      return <DealCard data={data} className={className} productCardSettings={productCardSettings} />;
    case "bold-grid":
      return <BoldGridCard data={data} className={className} productCardSettings={productCardSettings} />;
    case "editorial":
      return <EditorialCard data={data} className={className} productCardSettings={productCardSettings} />;
    case "minimal":
      return <MinimalCard data={data} className={className} productCardSettings={productCardSettings} />;
    default:
      return <ProductCard data={data} className={className} isLiked={isLiked} productCardSettings={productCardSettings} />;
  }
}
