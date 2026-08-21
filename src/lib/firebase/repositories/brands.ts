import "server-only";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { Brand } from "@/types/brand";

const COLLECTION = "brands";

export async function getBrands(): Promise<Brand[]> {
  return safeQuery("getBrands", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col
      .where("isActive", "==", true)
      .where("isDeleted", "==", false)
      .orderBy("order", "asc")
      .get();

    return snap.docs
      .map((doc) => docData<Brand>(doc))
      .filter((b): b is Brand => b !== null);
  });
}

export async function getBrandsByIds(ids: string[]): Promise<Brand[]> {
  if (!ids || !ids.length) return [];
  return safeQuery("getBrandsByIds", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col
      .where("isActive", "==", true)
      .where("isDeleted", "==", false)
      .get();

    const all = snap.docs
      .map((doc) => docData<Brand>(doc))
      .filter((b): b is Brand => b !== null);

    return ids
      .map((id) => all.find((b) => b.id === id))
      .filter((b): b is Brand => b !== undefined);
  });
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const col = await tenantCollection(COLLECTION);
  const snap = await col
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const brand = docData<Brand>(snap.docs[0]);
  if (!brand || brand.isDeleted || !brand.isActive) return null;
  return brand;
}

// --- Admin ---

export async function getBrandById(id: string): Promise<Brand | null> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc(id).get();
  return docData<Brand>(doc);
}

export async function getAllBrandsForAdmin(includeDeleted = false): Promise<Brand[]> {
  return safeQuery("getAllBrandsForAdmin", [], async () => {
    const col = await tenantCollection(COLLECTION);
    let query = col.orderBy("order", "asc") as FirebaseFirestore.Query;
    if (!includeDeleted) {
      query = query.where("isDeleted", "==", false);
    }
    const snap = await query.get();
    return snap.docs
      .map((doc) => docData<Brand>(doc))
      .filter((b): b is Brand => b !== null);
  });
}
