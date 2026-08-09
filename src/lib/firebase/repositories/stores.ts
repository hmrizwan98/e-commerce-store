import "server-only";
import { FieldPath, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "../admin";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { Store, StoreStatus } from "@/types/store";

/**
 * The one root-level (non-tenant-scoped) collection - this IS the tenant
 * registry, so it lives outside stores/{storeId}/... by definition. Only the
 * Super Admin app reads/writes this directly; every other repository reads
 * the current tenant via src/lib/tenant/current.ts instead.
 */
const COLLECTION = "stores";

export async function getStores(opts: { includeArchived?: boolean } = {}): Promise<Store[]> {
  const snap = await adminDb().collection(COLLECTION).orderBy("createdAt", "desc").get();
  const stores = snap.docs.map((doc) => docData<Store>(doc)).filter((s): s is Store => s !== null);
  return opts.includeArchived ? stores : stores.filter((s) => s.status !== "archived");
}

/** Non-archived statuses - `StoreStatus` only ever has these 3 values, so "not archived"
 * and "active + suspended" are the same set. Used by getStoreStatusCounts()/getRecentStores()
 * below to express "live stores" as a real Firestore filter instead of fetching every store
 * document to filter/count in memory. */
const LIVE_STATUSES: StoreStatus[] = ["active", "suspended"];

/**
 * For the Super Admin dashboard's KPI tiles, which previously called getStores() (a full
 * collection read) purely to derive these 3 counts in memory. Computed via count() aggregation
 * instead - zero store documents are transferred. `total` matches getStores()'s own
 * `includeArchived: false` semantics exactly (active + suspended, archived excluded), since
 * those are the only two non-archived statuses that exist.
 */
export async function getStoreStatusCounts(): Promise<{ total: number; active: number; suspended: number }> {
  const col = adminDb().collection(COLLECTION);
  const [activeSnap, suspendedSnap] = await Promise.all([
    col.where("status", "==", "active" satisfies StoreStatus).count().get(),
    col.where("status", "==", "suspended" satisfies StoreStatus).count().get(),
  ]);
  const active = activeSnap.data().count;
  const suspended = suspendedSnap.data().count;
  return { total: active + suspended, active, suspended };
}

/**
 * For the Super Admin dashboard's "Recent Stores" widget, which previously called
 * getStores({includeArchived:true}) (a full collection read) purely to take the first
 * `limit` non-archived entries off the front of an already-sorted array. A real bounded
 * query produces the identical result (same order, same "skip archived" behavior) without
 * reading every store the platform has ever provisioned.
 */
export async function getRecentStores(limit = 5): Promise<Store[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("status", "in", LIVE_STATUSES)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((doc) => docData<Store>(doc)).filter((s): s is Store => s !== null);
}

/**
 * For UI that only needs to label a storeId with its store name (e.g. the Super Admin
 * finance page's manual-payout store picker) - previously read via getStores(), which
 * transfers every field of every store (email, domains, settings, notes, subscription...)
 * just to build an {id,name} lookup. `.select("name")` limits the transfer to the one field
 * actually used; ordering and archived-inclusion match getStores({includeArchived:true})'s
 * existing behavior exactly, since a payout can reference an archived store's past activity.
 */
export async function getStoreIdsAndNames(): Promise<{ id: string; name: string }[]> {
  const snap = await adminDb().collection(COLLECTION).select("name").orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => ({ id: doc.id, name: (doc.data().name as string | undefined) ?? doc.id }));
}

export async function getStoreById(id: string): Promise<Store | null> {
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  return docData<Store>(doc);
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const snap = await adminDb().collection(COLLECTION).where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  return docData<Store>(snap.docs[0]);
}

export async function isSlugTaken(slug: string): Promise<boolean> {
  const snap = await adminDb().collection(COLLECTION).where("slug", "==", slug).limit(1).get();
  return !snap.empty;
}

export async function isDomainTaken(domain: string, excludeStoreId?: string): Promise<boolean> {
  const snap = await adminDb().collection(COLLECTION).where("domains", "array-contains", domain).limit(2).get();
  return snap.docs.some((doc) => doc.id !== excludeStoreId);
}

export async function searchStores(term: string): Promise<Store[]> {
  const q = term.trim().toLowerCase();
  if (!q) return getStores();
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("nameLower", ">=", q)
    .where("nameLower", "<=", q + "")
    .orderBy("nameLower", "asc")
    .get();
  return snap.docs
    .map((doc) => docData<Store>(doc))
    .filter((s): s is Store => s !== null && s.status !== "archived");
}

export interface AdminStoresCursor {
  /** createdAt millis (number) for default branch, nameLower (string) for search branch */
  value: number | string;
  id: string;
}

export interface AdminStoreSearchParams {
  q?: string;
  status?: StoreStatus | "all";
  pageSize?: number;
  startAfter?: AdminStoresCursor;
}

export interface AdminStoreSearchResult {
  stores: Store[];
  total: number;
  hasMore: boolean;
}

/**
 * Cursor-paginated variant for the Super Admin Stores Directory page.
 * Avoids full-collection scans by pushing status filters into Firestore, counting total
 * via count() aggregation, and fetching only `pageSize + 1` documents per page using cursors.
 */
export async function searchAdminStores(
  params: AdminStoreSearchParams
): Promise<AdminStoreSearchResult> {
  const pageSize = params.pageSize ?? 20;

  const col = adminDb().collection(COLLECTION);
  let baseQuery: FirebaseFirestore.Query = col;

  const term = params.q?.trim().toLowerCase();
  const isSearch = !!term;

  if (term) {
    baseQuery = baseQuery
      .where("nameLower", ">=", term)
      .where("nameLower", "<=", term + "")
      .orderBy("nameLower", "asc")
      .orderBy(FieldPath.documentId(), "asc");
  } else {
    if (params.status && params.status !== "all") {
      baseQuery = baseQuery.where("status", "==", params.status);
    } else if (!params.status) {
      baseQuery = baseQuery.where("status", "in", LIVE_STATUSES);
    }
    baseQuery = baseQuery.orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc");
  }

  return safeQuery("searchAdminStores", { stores: [], total: 0, hasMore: false }, async () => {
    const countSnap = await baseQuery.count().get();
    const total = countSnap.data().count;

    let pageQuery = baseQuery;
    if (params.startAfter) {
      const cursorValue = isSearch
        ? params.startAfter.value
        : Timestamp.fromMillis(params.startAfter.value as number);
      pageQuery = pageQuery.startAfter(cursorValue, params.startAfter.id);
    }

    const snap = await pageQuery.limit(pageSize + 1).get();
    const stores = snap.docs
      .slice(0, pageSize)
      .map((doc) => docData<Store>(doc))
      .filter((s): s is Store => s !== null);

    return { stores, total, hasMore: snap.docs.length > pageSize };
  });
}

