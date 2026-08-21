import "server-only";
import { cookies, headers } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { docData } from "@/lib/firebase/repositories/utils";
import { requestMemo } from "@/lib/request-cache";
import { TENANT_SLUG_HEADER, FRONTSTORE_COOKIE } from "./constants";
import type { Store } from "@/types/store";

/**
 * Resolves the current request's tenant two ways, in order:
 *
 * 1. Custom domain - if the raw request host doesn't look like one of our own
 *    {slug}.ROOT_DOMAIN subdomains (i.e. middleware.ts didn't set
 *    x-tenant-slug for it), match it exactly against a store's `domains[]`.
 *    This is how a customer's own domain (e.g. abcstore.com) resolves - no
 *    code change is needed per domain, only adding it to a store's
 *    `domains[]` from the Super Admin panel.
 * 2. Subdomain slug - the slug middleware.ts set on x-tenant-slug (derived
 *    from the subdomain), with a DEV_TENANT_SLUG fallback for local dev
 *    without wildcard DNS.
 *
 * Not wrapped in React's cache() - that combined with next/headers() across a
 * Server Action's post-action RSC re-render corrupted React's own hook
 * dispatcher state (manifested as "Cannot read properties of null (reading
 * 'useMemo'/'useContext')" crashes in unrelated components like redux's
 * <Provider>). A single indexed Firestore lookup per call is cheap enough
 * that the dedup isn't worth that risk.
 *
 * Returns null (not a throw) when no tenant applies to this request - this is
 * the expected, normal case for the reserved Super Admin subdomain and for
 * any request middleware.ts didn't map to a store. Callers that only ever run
 * in a real tenant context (every tenant-scoped repository, the image upload
 * pipeline) should use requireCurrentTenant() instead.
 *
 * An "archived" store never resolves (as if it doesn't exist). A "suspended"
 * store still resolves here so callers can show a suspended notice instead of
 * silently falling through to "no tenant" - requireCurrentTenant() is what
 * actually blocks non-active stores from being operated on.
 *
 * Memoized per-request via requestMemo() (a plain WeakMap keyed on the
 * Headers object, not React's cache() - see request-cache.ts) since every
 * tenantCollection()/tenantDoc() call and requireCurrentTenant() call
 * resolves the tenant independently; without this a single page render can
 * trigger a dozen-plus redundant `stores` lookups for the same tenant.
 */
export async function getCurrentTenant(): Promise<Store | null> {
  return requestMemo("current-tenant", () => resolveCurrentTenant());
}

async function resolveCurrentTenant(): Promise<Store | null> {
  const hdrs = headers();
  const headerSlug = hdrs.get(TENANT_SLUG_HEADER)?.trim() || null;
  const cookieSlug = cookies().get(FRONTSTORE_COOKIE)?.value?.trim() || null;
  const slugToResolve = headerSlug || cookieSlug;

  // 1. If an explicit tenant slug header or preview cookie is present, resolve by slug.
  if (slugToResolve) {
    const snap = await adminDb().collection("stores").where("slug", "==", slugToResolve).limit(1).get();
    if (!snap.empty) {
      const store = docData<Store>(snap.docs[0]);
      if (store && store.status !== "archived") return store;
    }
    // An explicit tenant slug was requested, but no matching active/suspended store exists.
    return null;
  }

  // 2. Custom domain lookup (e.g. merchantdomain.com).
  const rawHost = (hdrs.get("x-forwarded-host") || hdrs.get("host") || "").split(":")[0].toLowerCase();
  if (rawHost && rawHost !== "localhost" && rawHost !== "127.0.0.1") {
    const byDomain = await adminDb().collection("stores").where("domains", "array-contains", rawHost).limit(1).get();
    if (!byDomain.empty) {
      const store = docData<Store>(byDomain.docs[0]);
      if (store && store.status !== "archived") return store;
    }
  }

  // 3. Dev environment explicit DEV_TENANT_SLUG override.
  const devSlug = process.env.NODE_ENV !== "production" ? process.env.DEV_TENANT_SLUG?.trim() || null : null;
  if (devSlug) {
    const snap = await adminDb().collection("stores").where("slug", "==", devSlug).limit(1).get();
    if (!snap.empty) {
      const store = docData<Store>(snap.docs[0]);
      if (store && store.status !== "archived") return store;
    }
  }

  // 4. Local-dev convenience fallback: first available store (only when no slug or host matched).
  if (process.env.NODE_ENV !== "production") {
    const fallbackSnap = await adminDb().collection("stores").orderBy("createdAt", "asc").limit(1).get();
    if (!fallbackSnap.empty) {
      const store = docData<Store>(fallbackSnap.docs[0]);
      if (store && store.status !== "archived") return store;
    }
  }

  return null;
}

export async function requireCurrentTenant(): Promise<Store> {
  const tenant = await getCurrentTenant();
  if (!tenant) {
    throw new Error(
      "No tenant resolved for this request - missing/unknown x-tenant-slug or domain. Check middleware.ts, or set DEV_TENANT_SLUG in .env.local for local dev."
    );
  }
  if (tenant.status !== "active") {
    throw new Error(`Tenant "${tenant.slug}" is not active (status: ${tenant.status}).`);
  }
  return tenant;
}

export async function getCurrentTenantId(): Promise<string | null> {
  return (await getCurrentTenant())?.id ?? null;
}
