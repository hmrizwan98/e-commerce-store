import "server-only";
import { adminDb } from "../admin";
import { docData } from "./utils";
import type { Store } from "@/types/store";

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
