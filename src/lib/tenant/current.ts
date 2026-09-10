import "server-only";
import { cookies, headers } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { docData } from "@/lib/firebase/repositories/utils";
import { requestMemo } from "@/lib/request-cache";
import {
  TENANT_SLUG_HEADER,
  TENANT_CUSTOM_DOMAIN_HEADER,
  FRONTSTORE_COOKIE,
} from "./constants";
import { normalizeHostname } from "./hostname";
import type { Store } from "@/types/store";

/**
 * Resolves the current request's tenant in exact priority order:
 *
 * 1. Priority 1 — Exact Custom Hostname / Domain Mapping (e.g. glamix.pk or admin.glamix.pk)
 * 2. Priority 2 — Platform Tenant Subdomain (x-tenant-slug header set by middleware)
 * 3. Priority 3 — Reserved Platform Hostname Handling (webriiz.com, www.webriiz.com, superadmin.webriiz.com)
 * 4. Dev Fallbacks — DEV_TENANT_SLUG or first available store in non-production.
 *
 * Returns null when no tenant applies to this request (e.g. marketing or superadmin domain).
 * An "archived" store never resolves.
 * requireCurrentTenant() enforces status === "active" and rejects suspended stores.
 */
export async function getCurrentTenant(): Promise<Store | null> {
  return requestMemo("current-tenant", () => resolveCurrentTenant());
}

async function resolveCurrentTenant(): Promise<Store | null> {
  const hdrs = headers();

  const customDomainHeader = hdrs.get(TENANT_CUSTOM_DOMAIN_HEADER)?.trim() || null;
  const headerSlug = hdrs.get(TENANT_SLUG_HEADER)?.trim() || null;
  const cookieSlug = cookies().get(FRONTSTORE_COOKIE)?.value?.trim() || null;
  const rawHost = normalizeHostname(hdrs.get("x-forwarded-host") || hdrs.get("host") || "");
  const rootDomain = normalizeHostname(process.env.NEXT_PUBLIC_ROOT_DOMAIN);

  // 1. Priority 1: Exact Custom Hostname / Domain Mapping (e.g. glamix.pk or admin.glamix.pk)
  let domainToQuery = customDomainHeader;
  if (!domainToQuery && rawHost && rawHost !== "localhost" && rawHost !== "127.0.0.1") {
    if (!rootDomain || (!rawHost.endsWith(`.${rootDomain}`) && rawHost !== rootDomain && rawHost !== `www.${rootDomain}`)) {
      domainToQuery = rawHost.startsWith("admin.") ? rawHost.slice(6) : rawHost;
    }
  }

  if (domainToQuery) {
    const byDomain = await adminDb().collection("stores").where("domains", "array-contains", domainToQuery).limit(1).get();
    if (!byDomain.empty) {
      const store = docData<Store>(byDomain.docs[0]);
      if (store && store.status !== "archived") return store;
    }
  }

  // 2. Priority 2: Platform Tenant Subdomain (x-tenant-slug or preview cookie)
  const slugToResolve = headerSlug || cookieSlug;
  if (slugToResolve) {
    const snap = await adminDb().collection("stores").where("slug", "==", slugToResolve).limit(1).get();
    if (!snap.empty) {
      const store = docData<Store>(snap.docs[0]);
      if (store && store.status !== "archived") return store;
    }
    return null;
  }

  // 3. Priority 3: Reserved Platform Hostname Handling (webriiz.com, www.webriiz.com, superadmin.webriiz.com)
  const isReservedHost =
    (rootDomain && (rawHost === rootDomain || rawHost === `www.${rootDomain}` || rawHost === `superadmin.${rootDomain}`)) ||
    rawHost === "superadmin.localhost";

  if (isReservedHost) {
    return null;
  }

  // 4. Development environment explicit DEV_TENANT_SLUG override
  const devSlug = process.env.NODE_ENV !== "production" ? process.env.DEV_TENANT_SLUG?.trim() || null : null;
  if (devSlug) {
    const snap = await adminDb().collection("stores").where("slug", "==", devSlug).limit(1).get();
    if (!snap.empty) {
      const store = docData<Store>(snap.docs[0]);
      if (store && store.status !== "archived") return store;
    }
  }

  // 5. Local-dev fallback: first available store (only when no slug or host matched in non-prod)
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
