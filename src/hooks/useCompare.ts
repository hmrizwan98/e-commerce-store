"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readList, writeList, subscribeList } from "@/lib/client-storage/local-list";
import { trackEvent } from "@/lib/analytics/track";

const KEY = "compare_product_ids";
const MAX_COMPARE = 4;
const EMPTY: string[] = [];

export function useCompare() {
  const ids = useSyncExternalStore(
    (cb) => subscribeList(KEY, cb),
    () => readList(KEY),
    () => EMPTY
  );

  const isComparing = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => {
    const current = readList(KEY);
    if (current.includes(id)) {
      writeList(KEY, current.filter((i) => i !== id));
      trackEvent("compare_remove", { productId: id });
      return;
    }
    if (current.length >= MAX_COMPARE) return;
    writeList(KEY, [...current, id]);
    trackEvent("compare_add", { productId: id });
  }, []);

  const remove = useCallback((id: string) => {
    writeList(KEY, readList(KEY).filter((i) => i !== id));
  }, []);

  const clear = useCallback(() => writeList(KEY, []), []);

  return { ids, isComparing, toggle, remove, clear, maxCompare: MAX_COMPARE };
}
