"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import NotifyAddTocart from "@/components/NotifyAddTocart";
import { useProductOptions } from "@/hooks/useProductOptions";
import { recordRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useAppDispatch } from "@/utils/hooks/store";
import { addItem } from "@/store/slices/cartSlice";
import { trackEvent } from "@/lib/analytics/track";
import type { Product, ProductVariant } from "@/types/product";

/**
 * The derived state + add-to-cart handler every themed PDP variant needs -
 * extracted once so the real cartSlice.addItem dispatch shape (and its
 * matchedVariant/activePrice/activeStock inputs from useProductOptions,
 * the SAME shared hook the real ProductDetailClient uses) lives in exactly
 * one place, not copy-pasted per variant.
 */
export function useProductDetailState(product: Product, variants: ProductVariant[]) {
  const {
    selections,
    selectAttribute,
    matchedVariant,
    activeImage,
    activePrice,
    activeCompareAtPrice,
    activeStock,
    isOutOfStock,
  } = useProductOptions(product, variants);
  const [qualitySelected, setQualitySelected] = useState(1);
  const [isOpenModalViewAllReviews, setIsOpenModalViewAllReviews] = useState(false);

  useEffect(() => {
    recordRecentlyViewed(product.id);
    trackEvent("product_view", { productId: product.id, value: product.price });
  }, [product.id, product.price]);

  const sizeAttribute = product.attributes.find((a) => a.name.toLowerCase() === "size");
  const sizeSelected = sizeAttribute ? selections[sizeAttribute.name] : undefined;
  const variantLabel = Object.entries(selections)
    .filter(([name]) => name !== sizeAttribute?.name)
    .map(([, value]) => value)
    .join(" / ");

  const thumbnails = product.images.slice(1, 3);
  const dispatch = useAppDispatch();

  const notifyAddTocart = () => {
    dispatch(
      addItem({
        item: {
          productId: product.id,
          variantId: matchedVariant?.id,
          slug: product.slug,
          name: product.name,
          image: activeImage || product.images[0],
          price: activePrice,
          variantLabel: [variantLabel, sizeSelected].filter(Boolean).join(" / ") || undefined,
          maxStock: activeStock,
        },
        quantity: qualitySelected,
      })
    );
    trackEvent("add_to_cart", { productId: product.id, value: activePrice * qualitySelected });
    toast.custom(
      (t) => (
        <NotifyAddTocart
          product={product}
          qualitySelected={qualitySelected}
          show={t.visible}
          sizeSelected={sizeSelected}
          variantLabel={variantLabel}
        />
      ),
      { position: "top-right", id: "nc-product-notify", duration: 3000 }
    );
  };

  return {
    selections,
    selectAttribute,
    matchedVariant,
    activeImage,
    activePrice,
    activeCompareAtPrice,
    activeStock,
    isOutOfStock,
    qualitySelected,
    setQualitySelected,
    isOpenModalViewAllReviews,
    setIsOpenModalViewAllReviews,
    sizeAttribute,
    sizeSelected,
    thumbnails,
    notifyAddTocart,
  };
}
