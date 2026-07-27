"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readList, writeList, subscribeList } from "@/lib/client-storage/local-list";
import { trackEvent } from "@/lib/analytics/track";

const KEY = "wishlist_product_ids";
const EMPTY: string[] = [];

export function useWishlist() {
  const ids = useSyncExternalStore(
    (cb) => subscribeList(KEY, cb),
    () => readList(KEY),
    () => EMPTY
  );

  const isWishlisted = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => {
    const current = readList(KEY);
    const wasWishlisted = current.includes(id);
    const next = wasWishlisted ? current.filter((i) => i !== id) : [...current, id];
    writeList(KEY, next);
    trackEvent(wasWishlisted ? "wishlist_remove" : "wishlist_add", { productId: id });
  }, []);

  const remove = useCallback((id: string) => {
    writeList(KEY, readList(KEY).filter((i) => i !== id));
  }, []);

  return { ids, isWishlisted, toggle, remove };
}
