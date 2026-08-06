import "server-only";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { Collection } from "@/types/collection";
import type { Product } from "@/types/product";

const COLLECTION = "collections";

export async function getCollections(): Promise<Collection[]> {
  return safeQuery("getCollections", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col
      .where("isActive", "==", true)
      .where("isDeleted", "==", false)
      .orderBy("order", "asc")
      .get();

    return snap.docs
      .map((doc) => docData<Collection>(doc))
      .filter((c): c is Collection => c !== null);
  });
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const col = await tenantCollection(COLLECTION);
  const snap = await col.where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const collection = docData<Collection>(snap.docs[0]);
  if (!collection || collection.isDeleted || !collection.isActive) return null;
  return collection;
}

/** Storefront-ready lookup, not yet wired into a browsing route (out of scope for this
 * pass - see README's Enterprise Product & Inventory Management section). */
export async function getProductsByCollectionId(collectionId: string, limit = 24): Promise<Product[]> {
  return safeQuery("getProductsByCollectionId", [], async () => {
    const col = await tenantCollection("products");
    const snap = await col
      .where("status", "==", "active")
      .where("isDeleted", "==", false)
      .where("collectionIds", "array-contains", collectionId)
      .limit(limit)
      .get();
    return snap.docs
      .map((doc) => docData<Product>(doc))
      .filter((p): p is Product => p !== null);
  });
}

// --- Admin ---

export async function getCollectionById(id: string): Promise<Collection | null> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc(id).get();
  return docData<Collection>(doc);
}

export async function getAllCollectionsForAdmin(includeDeleted = false): Promise<Collection[]> {
  return safeQuery("getAllCollectionsForAdmin", [], async () => {
    const col = await tenantCollection(COLLECTION);
    let query = col.orderBy("order", "asc") as FirebaseFirestore.Query;
    if (!includeDeleted) {
      query = query.where("isDeleted", "==", false);
    }
    const snap = await query.get();
    return snap.docs
      .map((doc) => docData<Collection>(doc))
      .filter((c): c is Collection => c !== null);
  });
}
