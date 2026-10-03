"use client";

import { useAppDispatch } from "@/utils/hooks/store";
import { addItem } from "@/store/slices/cartSlice";
import { trackEvent } from "@/lib/analytics/track";
import type { Product, ProductVariant } from "@/types/product";

export interface AddToCartInput {
  product: Product;
  matchedVariant?: ProductVariant;
  activeImage?: string;
  activePrice: number;
  activeStock: number;
  variantLabel?: string;
  quantity: number;
}

/** The one cartSlice.addItem dispatch shape, shared by the product page
 * (useProductDetailState) and both quick-view modals. */
export function useAddToCart() {
  const dispatch = useAppDispatch();
  return ({ product, matchedVariant, activeImage, activePrice, activeStock, variantLabel, quantity }: AddToCartInput) => {
    dispatch(
      addItem({
        item: {
          productId: product.id,
          variantId: matchedVariant?.id,
          slug: product.slug,
          name: product.name,
          image: activeImage || product.images[0],
          price: activePrice,
          variantLabel: variantLabel || undefined,
          maxStock: activeStock,
        },
        quantity,
      })
    );
    trackEvent("add_to_cart", { productId: product.id, value: activePrice * quantity });
  };
}
