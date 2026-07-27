import "server-only";
import { adminDb } from "../admin";
import { docData } from "./utils";
import type { Category } from "@/types/category";

const COLLECTION = "categories";

export async function getCategories(): Promise<Category[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("isActive", "==", true)
    .where("isDeleted", "==", false)
    .orderBy("order", "asc")
    .get();

  return snap.docs
    .map((doc) => docData<Category>(doc))
    .filter((c): c is Category => c !== null);
}

export async function getHomepageCategories(): Promise<Category[]> {
  const categories = await getCategories();
  return categories.filter((c) => c.showOnHomepage);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snap.empty) return null;
  return docData<Category>(snap.docs[0]);
}

// --- Admin ---

export async function getCategoryById(id: string): Promise<Category | null> {
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  return docData<Category>(doc);
}

export async function getCategoriesByIds(ids: string[]): Promise<Category[]> {
  if (!ids.length) return [];
  const docs = await Promise.all(ids.map((id) => adminDb().collection(COLLECTION).doc(id).get()));
  return docs
    .map((doc) => docData<Category>(doc))
    .filter((c): c is Category => c !== null && c.isActive && !c.isDeleted);
}

/**
 * Cheap server-side counts (Firestore .count() aggregation, not document
 * reads) for the categories actually being rendered - only called when a
 * homepage section's "Show product count" toggle is on, so it's zero extra
 * cost otherwise. Reuses the same status/isDeleted/categoryIds fields as the
 * existing composite index used by searchProducts's category filter.
 */
export async function getCategoryProductCounts(categoryIds: string[]): Promise<Record<string, number>> {
  if (!categoryIds.length) return {};
  const entries = await Promise.all(
    categoryIds.map(async (id) => {
      const snap = await adminDb()
        .collection("products")
        .where("categoryIds", "array-contains", id)
        .where("isDeleted", "==", false)
        .where("status", "==", "active")
        .count()
        .get();
      return [id, snap.data().count] as const;
    })
  );
  return Object.fromEntries(entries);
}

export async function getAllCategoriesForAdmin(includeDeleted = false): Promise<Category[]> {
  let query = adminDb().collection(COLLECTION).orderBy("order", "asc") as FirebaseFirestore.Query;
  if (!includeDeleted) {
    query = query.where("isDeleted", "==", false);
  }
  const snap = await query.get();
  return snap.docs
    .map((doc) => docData<Category>(doc))
    .filter((c): c is Category => c !== null);
}
