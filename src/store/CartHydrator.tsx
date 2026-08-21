"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/utils/hooks/store";
import { hydrateCart, getCartStorageKey, type CartItem } from "@/store/slices/cartSlice";

/**
 * Runs after mount (never during the hydration render itself) to load the
 * real localStorage cart - keeps the very first client render identical to
 * the server's (always empty), avoiding a hydration mismatch.
 *
 * Depends on `usePathname()` (Phase 8A, temporary) so that switching which
 * tenant is being previewed via /frontstore/{slug} - a client-side
 * navigation that does NOT remount this component, since it lives in the
 * root layout - re-reads the correctly-namespaced storage key and replaces
 * the in-memory Redux cart too, not just the key written on the next
 * change. Outside of /frontstore/, the derived key never changes across
 * navigations, so this behaves exactly as the original mount-once effect did.
 */
export default function CartHydrator() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const storageKey = getCartStorageKey(pathname);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      dispatch(hydrateCart(raw ? (JSON.parse(raw) as CartItem[]) : []));
    } catch {
      // ignore malformed localStorage content
    }
  }, [dispatch, storageKey]);

  return null;
}
