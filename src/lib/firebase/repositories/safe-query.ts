import "server-only";
import { headers } from "next/headers";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds in-memory cache for ultra-fast TTFB

const MAX_CACHE_ENTRIES = 1000;

/**
 * Wraps a Firestore query so a missing or still-building composite index
 * (FAILED_PRECONDITION) never crashes the calling page - logs the error and
 * returns the given fallback instead, so the caller renders its existing
 * empty state rather than throwing past the repository layer.
 *
 * Optional 30s in-memory cache (TTFB): ONLY when the caller passes `cacheArgs` - the query's
 * own arguments, which become part of the key - and only when the request has a tenant.
 * It used to cache every call by tenant + label alone, so different arguments shared one
 * entry (e.g. any blog slug returned the first one requested, promo slots returned hero
 * banners, one product's reviews showed on another, filters/pages returned stale results),
 * and a request without a tenant header shared the cache across stores.
 */
export async function safeQuery<T>(label: string, fallback: T, fn: () => Promise<T>, cacheArgs?: readonly unknown[]): Promise<T> {
  let cacheKey: string | null = null;
  if (cacheArgs) {
    try {
      const hdrs = headers();
      const tenantSlug = hdrs.get("x-tenant-slug") || hdrs.get("x-forwarded-host") || "";
      if (tenantSlug) cacheKey = safeQueryCacheKey(tenantSlug, label, cacheArgs);
    } catch {
      // headers() throws outside a request (scripts/tests) -> no caching
    }
  }

  const now = Date.now();
  if (cacheKey) {
    const existing = memoryCache.get(cacheKey);
    if (existing && now - existing.timestamp < CACHE_TTL_MS) {
      return existing.data;
    }
  }

  try {
    const res = await fn();
    if (cacheKey) {
      if (memoryCache.size >= MAX_CACHE_ENTRIES) memoryCache.clear();
      memoryCache.set(cacheKey, { data: res, timestamp: now });
    }
    return res;
  } catch (err) {
    if (isMissingIndexError(err)) {
      console.error(`[safeQuery] "${label}" - Firestore composite index missing or still building, returning fallback.`, err);
      return fallback;
    }
    throw err;
  }
}

/** Tenant + label + the query's own arguments (pure; exported for tests). */
export function safeQueryCacheKey(tenant: string, label: string, args: readonly unknown[]): string {
  return `${tenant}:${label}:${JSON.stringify(args)}`;
}

function isMissingIndexError(err: unknown): boolean {
  const code = (err as { code?: unknown } | null)?.code;
  const message = (err as { message?: unknown } | null)?.message;
  if (code === 9 || code === "failed-precondition") return true; // gRPC FAILED_PRECONDITION
  return typeof message === "string" && /FAILED_PRECONDITION|requires an index/i.test(message);
}
