"use client";

import React from "react";
import type { Product, ProductVariant, ProductAttribute } from "@/types/product";

export interface SizeGridProps {
  product: Product;
  variants: ProductVariant[];
  sizeAttribute: ProductAttribute;
  sizeSelected?: string;
  selectAttribute: (name: string, value: string) => void;
}

/** Real per-size stock check via the same `variants` array the PDP already fetched - never a second stock source. */
export default function SizeGrid({ product, variants, sizeAttribute, sizeSelected, selectAttribute }: SizeGridProps) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 mt-3">
      {sizeAttribute.values.map((value, index) => {
        const size = typeof value === "string" ? value : value.label;
        const isActive = size === sizeSelected;
        const sizeOutOfStock =
          product.hasVariants && !variants.some((v) => v.attributeSelections[sizeAttribute.name] === size && v.stock > 0);
        return (
          <div
            key={index}
            className={`relative h-10 sm:h-11 rounded-2xl border flex items-center justify-center text-sm sm:text-base uppercase font-semibold select-none overflow-hidden z-0 ${
              sizeOutOfStock ? "text-opacity-20 dark:text-opacity-20 cursor-not-allowed" : "cursor-pointer"
            } ${
              isActive
                ? "bg-primary-6000 border-primary-6000 text-white hover:bg-primary-6000"
                : "border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            }`}
            onClick={() => {
              if (sizeOutOfStock) return;
              selectAttribute(sizeAttribute.name, size);
            }}
          >
            {size}
          </div>
        );
      })}
    </div>
  );
}
