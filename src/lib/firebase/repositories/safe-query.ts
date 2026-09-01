import "server-only";
import { headers } from "next/headers";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds in-memory cache for ultra-fast TTFB

/**
 * Wraps a Firestore query so a missing or still-building composite index
 * (FAILED_PRECONDITION) never crashes the calling page - logs the error and
 * returns the given fallback instead, so the caller renders its existing
 * empty state rather than throwing past the repository layer. Also caches query
 * results in memory for 30s per tenant to eliminate multi-query Firestore network latency.
 */
export async function safeQuery<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<T> {
  let cacheKey = label;
  try {
    const hdrs = headers();
    const tenantSlug = hdrs.get("x-tenant-slug") || hdrs.get("x-forwarded-host") || "";
    if (tenantSlug) {
      cacheKey = `${tenantSlug}:${label}`;
    }
  } catch (e) {
    // headers() might throw in non-RSC contexts
  }

  const existing = memoryCache.get(cacheKey);
  const now = Date.now();
  if (existing && now - existing.timestamp < CACHE_TTL_MS) {
    return existing.data;
  }

  try {
    const res = await fn();
    memoryCache.set(cacheKey, { data: res, timestamp: now });
    return res;
  } catch (err) {
    if (isMissingIndexError(err)) {
      console.error(`[safeQuery] "${label}" - Firestore composite index missing or still building, returning fallback.`, err);
      return fallback;
    }
    throw err;
  }
}

function isMissingIndexError(err: unknown): boolean {
  const code = (err as { code?: unknown } | null)?.code;
  const message = (err as { message?: unknown } | null)?.message;
  if (code === 9 || code === "failed-precondition") return true; // gRPC FAILED_PRECONDITION
  return typeof message === "string" && /FAILED_PRECONDITION|requires an index/i.test(message);
}
