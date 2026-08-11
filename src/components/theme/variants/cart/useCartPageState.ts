"use client";

import { useAppDispatch, useAppSelector } from "@/utils/hooks/store";
import { removeItem, updateQuantity } from "@/store/slices/cartSlice";
import { computeOrderTotals } from "@/lib/checkout/totals";
import { trackEvent } from "@/lib/analytics/track";

export interface CartPageStateInput {
  shippingFlatRate: number;
  freeShippingThreshold?: number;
  taxRatePercent: number;
  taxInclusive: boolean;
}

/** The exact Redux reads/actions + computeOrderTotals call CartClient.tsx uses, shared so no themed variant reimplements cart math. */
export function useCartPageState({ shippingFlatRate, freeShippingThreshold, taxRatePercent, taxInclusive }: CartPageStateInput) {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totals = computeOrderTotals({ subtotal, shippingFlatRate, freeShippingThreshold, taxRatePercent, taxInclusive });

  const setQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    dispatch(updateQuantity({ productId, variantId, quantity }));
  };

  const remove = (productId: string, variantId: string | undefined, price: number, quantity: number) => {
    dispatch(removeItem({ productId, variantId }));
    trackEvent("remove_from_cart", { productId, value: price * quantity });
  };

  return { items, totals, setQuantity, remove };
}
