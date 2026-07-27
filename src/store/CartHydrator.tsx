"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/utils/hooks/store";
import { hydrateCart, CART_STORAGE_KEY, type CartItem } from "@/store/slices/cartSlice";

// Runs once after mount (never during the hydration render itself) to load
// the real localStorage cart - keeps the very first client render identical
// to the server's (always empty), avoiding a hydration mismatch.
export default function CartHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) dispatch(hydrateCart(JSON.parse(raw) as CartItem[]));
    } catch {
      // ignore malformed localStorage content
    }
  }, [dispatch]);

  return null;
}
