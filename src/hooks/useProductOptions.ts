"use client";

import { useMemo, useState } from "react";
import type { Product, ProductVariant } from "@/types/product";

function firstValueLabel(values: Product["attributes"][number]["values"]): string {
  const first = values[0];
  return typeof first === "string" ? first : first?.label ?? "";
}

function defaultSelections(product: Product, variants: ProductVariant[]) {
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
  const selections: Record<string, string> = {};
  for (const attribute of product.attributes) {
    selections[attribute.name] =
      defaultVariant?.attributeSelections[attribute.name] ??
      firstValueLabel(attribute.values);
  }
  return selections;
}

/**
 * Resolves the product's attribute-driven variant/size/color selection state.
 * Shared by the PDP and both quick-view components so "pick an attribute value
 * -> find the matching variant -> swap image/price/stock" logic exists once.
 */
export function useProductOptions(product: Product, variants: ProductVariant[] = []) {
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    defaultSelections(product, variants)
  );

  const matchedVariant = useMemo(() => {
    if (!product.hasVariants || !variants.length) return undefined;
    return variants.find((variant) =>
      product.attributes.every(
        (attr) => variant.attributeSelections[attr.name] === selections[attr.name]
      )
    );
  }, [product, variants, selections]);

  function selectAttribute(attributeName: string, value: string) {
    setSelections((prev) => ({ ...prev, [attributeName]: value }));
  }

  const activeImage = matchedVariant?.image ?? product.images[0];
  const activePrice = matchedVariant?.price ?? product.price;
  const activeCompareAtPrice = matchedVariant?.compareAtPrice ?? product.compareAtPrice;
  const activeStock = product.hasVariants ? matchedVariant?.stock ?? 0 : product.stock;
  const isOutOfStock = product.trackInventory && activeStock <= 0;

  return {
    selections,
    selectAttribute,
    matchedVariant,
    activeImage,
    activePrice,
    activeCompareAtPrice,
    activeStock,
    isOutOfStock,
  };
}
