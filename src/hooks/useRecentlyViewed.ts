"use client";

import { useSyncExternalStore } from "react";
import { readList, writeList, subscribeList } from "@/lib/client-storage/local-list";

const KEY = "recently_viewed_product_ids";
const MAX_RECENTLY_VIEWED = 12;
const EMPTY: string[] = [];

export function useRecentlyViewed() {
  const ids = useSyncExternalStore(
    (cb) => subscribeList(KEY, cb),
    () => readList(KEY),
    () => EMPTY
  );
  return { ids };
}

export function recordRecentlyViewed(id: string): void {
  const current = readList(KEY).filter((i) => i !== id);
  writeList(KEY, [id, ...current].slice(0, MAX_RECENTLY_VIEWED));
}
