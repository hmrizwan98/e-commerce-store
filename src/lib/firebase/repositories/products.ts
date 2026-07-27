import "server-only";
import { adminDb } from "../admin";
import { docData } from "./utils";
import { getCategories } from "./categories";
import type { Product, ProductVariant } from "@/types/product";

const COLLECTION = "products";

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("status", "==", "active")
    .where("isDeleted", "==", false)
    .where("isFeatured", "==", true)
    .limit(limit)
    .get();

  return snap.docs
    .map((doc) => docData<Product>(doc))
    .filter((p): p is Product => p !== null);
}

async function getFlaggedProducts(flag: "isNewArrival" | "isBestSeller" | "isOnSale", limit: number): Promise<Product[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("status", "==", "active")
    .where("isDeleted", "==", false)
    .where(flag, "==", true)
    .limit(limit)
    .get();

  return snap.docs
    .map((doc) => docData<Product>(doc))
    .filter((p): p is Product => p !== null);
}

export async function getNewArrivalProducts(limit = 8): Promise<Product[]> {
  return getFlaggedProducts("isNewArrival", limit);
}

export async function getBestSellerProducts(limit = 8): Promise<Product[]> {
  return getFlaggedProducts("isBestSeller", limit);
}

export async function getOnSaleProducts(limit = 8): Promise<Product[]> {
  return getFlaggedProducts("isOnSale", limit);
}

export async function getProducts(limit = 24): Promise<Product[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("status", "==", "active")
    .where("isDeleted", "==", false)
    .limit(limit)
    .get();

  return snap.docs
    .map((doc) => docData<Product>(doc))
    .filter((p): p is Product => p !== null);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const product = docData<Product>(snap.docs[0]);
  if (!product || product.isDeleted || product.status !== "active") return null;
  return product;
}

export async function getProductVariants(
  productId: string
): Promise<ProductVariant[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .doc(productId)
    .collection("variants")
    .orderBy("order", "asc")
    .get();

  return snap.docs
    .map((doc) => docData<ProductVariant>(doc))
    .filter((v): v is ProductVariant => v !== null);
}

/**
 * Prefers the admin's explicit `relatedProductIds` (Shopify-style manual
 * override) if set; otherwise falls back to same-category products, topped
 * up with featured products if fewer than `minCount` matches are found (e.g.
 * a niche category with only 1-2 other items) - keeps "related products"
 * from ever looking sparse.
 */
export async function getRelatedProducts(
  product: Pick<Product, "id" | "categoryIds" | "relatedProductIds">,
  limit = 8,
  minCount = 4
): Promise<Product[]> {
  if (product.relatedProductIds?.length) {
    const docs = await Promise.all(
      product.relatedProductIds
        .slice(0, limit)
        .map((id) => adminDb().collection(COLLECTION).doc(id).get())
    );
    const manual = docs
      .map((doc) => docData<Product>(doc))
      .filter(
        (p): p is Product =>
          p !== null && p.id !== product.id && !p.isDeleted && p.status === "active"
      );
    if (manual.length) return manual;
  }

  if (!product.categoryIds.length) {
    return (await getFeaturedProducts(limit)).filter((p) => p.id !== product.id);
  }

  const snap = await adminDb()
    .collection(COLLECTION)
    .where("status", "==", "active")
    .where("isDeleted", "==", false)
    .where("categoryIds", "array-contains", product.categoryIds[0])
    .limit(limit + 1)
    .get();

  const related = snap.docs
    .map((doc) => docData<Product>(doc))
    .filter((p): p is Product => p !== null && p.id !== product.id)
    .slice(0, limit);

  if (related.length >= minCount) return related;

  const seen = new Set(related.map((p) => p.id));
  const featured = await getFeaturedProducts(limit);
  for (const p of featured) {
    if (related.length >= limit) break;
    if (p.id === product.id || seen.has(p.id)) continue;
    related.push(p);
    seen.add(p.id);
  }
  return related;
}

export async function getProductsByIds(ids: string[], limit = 8): Promise<Product[]> {
  if (!ids.length) return [];
  const docs = await Promise.all(
    ids.slice(0, limit).map((id) => adminDb().collection(COLLECTION).doc(id).get())
  );
  return docs
    .map((doc) => docData<Product>(doc))
    .filter((p): p is Product => p !== null && !p.isDeleted && p.status === "active");
}

export interface SearchProductsParams {
  category?: string; // category display name - resolved to a categoryId below
  categoryId?: string; // use directly when the caller already has the id (skips the name lookup)
  brand?: string; // brandId
  color?: string[];
  size?: string[];
  inStock?: boolean;
  sale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: "price-asc" | "price-desc" | "newest" | "featured" | "rating";
  page?: number;
  pageSize?: number;
}

export interface SearchProductsResult {
  products: Product[];
  total: number;
  totalPages: number;
}

/**
 * Firestore can only apply a range/inequality filter on ONE field per query,
 * and the first orderBy must match that field when present. So: every
 * equality/array-contains facet (category/brand/color/size/inStock) is a
 * real Firestore filter, freely combinable; price range is the one allowed
 * range filter (and forces ordering by price); `minRating` is applied as an
 * in-memory refinement over the fetched page - acceptable at this catalog's
 * size, revisit with Algolia/Typesense (see README/plan) if that stops being true.
 */
export async function searchProducts(
  params: SearchProductsParams
): Promise<SearchProductsResult> {
  const pageSize = params.pageSize ?? 24;
  const page = Math.max(1, params.page ?? 1);

  let query: FirebaseFirestore.Query = adminDb()
    .collection(COLLECTION)
    .where("status", "==", "active")
    .where("isDeleted", "==", false);

  if (params.categoryId) {
    query = query.where("categoryIds", "array-contains", params.categoryId);
  } else if (params.category) {
    const categories = await getCategories();
    const match = categories.find(
      (c) => c.name.toLowerCase() === params.category!.toLowerCase()
    );
    if (!match) {
      return { products: [], total: 0, totalPages: 1 };
    }
    query = query.where("categoryIds", "array-contains", match.id);
  }

  if (params.brand) {
    query = query.where("brandId", "==", params.brand);
  }

  if (params.color?.length) {
    query = query.where(
      "colorFacets",
      "array-contains-any",
      params.color.map((c) => c.toLowerCase()).slice(0, 10)
    );
  }

  if (params.size?.length) {
    query = query.where(
      "sizeFacets",
      "array-contains-any",
      params.size.map((s) => s.toLowerCase()).slice(0, 10)
    );
  }

  if (params.inStock) {
    // NOTE: this is itself a range filter on `stock` - combining inStock with
    // a price range simultaneously would ask Firestore for two different
    // inequality fields in one query, which it rejects. Not reachable today
    // (no UI sets both at once yet); if inStock gets its own filter control,
    // pick one field as the "true" range filter and refine the other in
    // memory, same as minRating below.
    query = query.where("stock", ">", 0);
  }

  if (params.sale) {
    query = query.where("badge", "==", "sale");
  }

  const hasPriceRange = params.minPrice != null || params.maxPrice != null;
  if (hasPriceRange) {
    if (params.minPrice != null) query = query.where("price", ">=", params.minPrice);
    if (params.maxPrice != null) query = query.where("price", "<=", params.maxPrice);
    query = query.orderBy("price", params.sort === "price-desc" ? "desc" : "asc");
  } else {
    switch (params.sort) {
      case "price-asc":
        query = query.orderBy("price", "asc");
        break;
      case "price-desc":
        query = query.orderBy("price", "desc");
        break;
      case "newest":
        query = query.orderBy("createdAt", "desc");
        break;
      case "rating":
        query = query.orderBy("rating", "desc");
        break;
      default:
        query = query.orderBy("isFeatured", "desc").orderBy("order", "asc");
    }
  }

  const countSnap = await query.count().get();
  const total = countSnap.data().count;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const snap = await query
    .offset((page - 1) * pageSize)
    .limit(pageSize)
    .get();

  let products = snap.docs
    .map((doc) => docData<Product>(doc))
    .filter((p): p is Product => p !== null);

  if (params.minRating != null) {
    products = products.filter((p) => (p.rating ?? 0) >= params.minRating!);
  }

  return { products, total, totalPages };
}

// --- Admin ---

export async function getProductById(id: string): Promise<Product | null> {
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  return docData<Product>(doc);
}

export interface AdminProductSearchParams {
  q?: string;
  status?: "draft" | "active" | "archived";
  categoryId?: string;
  brandId?: string;
  trashed?: boolean; // true = only isDeleted docs, false/undefined = only non-deleted
  page?: number;
  pageSize?: number;
}

export async function searchAdminProducts(
  params: AdminProductSearchParams
): Promise<SearchProductsResult> {
  const pageSize = params.pageSize ?? 20;
  const page = Math.max(1, params.page ?? 1);

  let query: FirebaseFirestore.Query = adminDb()
    .collection(COLLECTION)
    .where("isDeleted", "==", Boolean(params.trashed));

  if (params.status) {
    query = query.where("status", "==", params.status);
  }
  if (params.categoryId) {
    query = query.where("categoryIds", "array-contains", params.categoryId);
  }
  if (params.brandId) {
    query = query.where("brandId", "==", params.brandId);
  }

  const term = params.q?.trim().toLowerCase();
  if (term) {
    query = query
      .where("nameLower", ">=", term)
      .where("nameLower", "<=", term + "")
      .orderBy("nameLower", "asc");
  } else {
    query = query.orderBy("updatedAt", "desc");
  }

  const countSnap = await query.count().get();
  const total = countSnap.data().count;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const snap = await query
    .offset((page - 1) * pageSize)
    .limit(pageSize)
    .get();

  const products = snap.docs
    .map((doc) => docData<Product>(doc))
    .filter((p): p is Product => p !== null);

  return { products, total, totalPages };
}

export async function getInventoryProducts(): Promise<Product[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("isDeleted", "==", false)
    .where("trackInventory", "==", true)
    .get();

  return snap.docs
    .map((doc) => docData<Product>(doc))
    .filter((p): p is Product => p !== null)
    .sort((a, b) => a.stock - b.stock);
}

export async function searchProductsByName(q: string, limit = 24): Promise<Product[]> {
  const term = q.trim().toLowerCase();
  if (!term) return getProducts(limit);

  const snap = await adminDb()
    .collection(COLLECTION)
    .where("status", "==", "active")
    .where("isDeleted", "==", false)
    .where("nameLower", ">=", term)
    .where("nameLower", "<=", term + "")
    .limit(limit)
    .get();

  return snap.docs
    .map((doc) => docData<Product>(doc))
    .filter((p): p is Product => p !== null);
}
