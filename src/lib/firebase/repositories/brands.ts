import "server-only";
import { adminDb } from "../admin";
import { docData } from "./utils";
import type { Brand } from "@/types/brand";

const COLLECTION = "brands";

export async function getBrands(): Promise<Brand[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("isActive", "==", true)
    .where("isDeleted", "==", false)
    .orderBy("order", "asc")
    .get();

  return snap.docs
    .map((doc) => docData<Brand>(doc))
    .filter((b): b is Brand => b !== null);
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const snap = await adminDb()
    .collection(COLLECTION)
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
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  return docData<Brand>(doc);
}

export async function getAllBrandsForAdmin(includeDeleted = false): Promise<Brand[]> {
  let query = adminDb().collection(COLLECTION).orderBy("order", "asc") as FirebaseFirestore.Query;
  if (!includeDeleted) {
    query = query.where("isDeleted", "==", false);
  }
  const snap = await query.get();
  return snap.docs
    .map((doc) => docData<Brand>(doc))
    .filter((b): b is Brand => b !== null);
}
