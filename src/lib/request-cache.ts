import "server-only";
import { headers } from "next/headers";

const store = new WeakMap<Headers, Map<string, Promise<unknown>>>();

/**
 * Per-request memoization keyed off the stable Headers object next/headers() returns for
 * this request. Deliberately NOT React's cache() - that combined with next/headers()
 * across a Server Action's post-action RSC re-render previously corrupted React's own hook
 * dispatcher state (see src/lib/tenant/current.ts's comment). A plain WeakMap keyed on the
 * Headers object identity dedupes repeat calls within one request without touching that
 * primitive at all.
 */
export function requestMemo<T>(key: string, compute: () => Promise<T>): Promise<T> {
  const hdrs = headers();
  let bucket = store.get(hdrs);
  if (!bucket) {
    bucket = new Map();
    store.set(hdrs, bucket);
  }
  if (!bucket.has(key)) {
    bucket.set(key, compute());
  }
  return bucket.get(key) as Promise<T>;
}
