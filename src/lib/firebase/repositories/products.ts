import "server-only";
import { FieldPath, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import { getCategories } from "./categories";
import type { Product, ProductVariant } from "@/types/product";

const COLLECTION = "products";

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return safeQuery("getFeaturedProducts", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col
      .where("status", "==", "active")
      .where("isDeleted", "==", false)
      .where("isFeatured", "==", true)
      .limit(limit)
      .get();

    return snap.docs
      .map((doc) => docData<Product>(doc))
      .filter((p): p is Product => p !== null);
  });
}

async function getFlaggedProducts(flag: "isNewArrival" | "isBestSeller" | "isOnSale", limit: number): Promise<Product[]> {
  return safeQuery(`getFlaggedProducts:${flag}`, [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col
      .where("status", "==", "active")
      .where("isDeleted", "==", false)
      .where(flag, "==", true)
      .limit(limit)
      .get();

    return snap.docs
      .map((doc) => docData<Product>(doc))
      .filter((p): p is Product => p !== null);
  });
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
  return safeQuery("getProducts", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col
      .where("status", "==", "active")
      .where("isDeleted", "==", false)
      .limit(limit)
      .get();

    return snap.docs
      .map((doc) => docData<Product>(doc))
      .filter((p): p is Product => p !== null);
  });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const col = await tenantCollection(COLLECTION);
  const snap = await col
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
  const col = await tenantCollection(COLLECTION);
  const snap = await col
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
  const col = await tenantCollection(COLLECTION);

  if (product.relatedProductIds?.length) {
    const docs = await Promise.all(
      product.relatedProductIds
        .slice(0, limit)
        .map((id) => col.doc(id).get())
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

  const related = await safeQuery("getRelatedProducts", [] as Product[], async () => {
    const snap = await col
      .where("status", "==", "active")
      .where("isDeleted", "==", false)
      .where("categoryIds", "array-contains", product.categoryIds[0])
      .limit(limit + 1)
      .get();

    return snap.docs
      .map((doc) => docData<Product>(doc))
      .filter((p): p is Product => p !== null && p.id !== product.id)
      .slice(0, limit);
  });

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
  const col = await tenantCollection(COLLECTION);
  const refs = ids.slice(0, limit).map((id) => col.doc(id));
  const docs = await col.firestore.getAll(...refs);
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
 * and the first orderBy must match that field when present. Firestore also
 * allows AT MOST ONE array-contains/array-contains-any clause per query -
 * category (array-contains), color, and size (both array-contains-any)
 * cannot be combined as three separate real filters. So: category is always
 * a real Firestore filter when present; color/size are real Firestore
 * filters only when category is absent AND at most one of them is requested
 * - the moment more than one array-type facet is active at once, every
 * facet after the first is applied as an in-memory refinement over the
 * fetched page instead, the same trade-off already accepted for `minRating`
 * below. brand/inStock/sale remain real Firestore filters (no array-type
 * conflict); price range is the one allowed range filter (and forces
 * ordering by price).
 */
export async function searchProducts(
  params: SearchProductsParams
): Promise<SearchProductsResult> {
  const pageSize = params.pageSize ?? 24;
  const page = Math.max(1, params.page ?? 1);

  const col = await tenantCollection(COLLECTION);
  let query: FirebaseFirestore.Query = col
    .where("status", "==", "active")
    .where("isDeleted", "==", false);

  let categoryId: string | undefined = params.categoryId;
  if (!categoryId && params.category) {
    const categories = await getCategories();
    const match = categories.find(
      (c) => c.name.toLowerCase() === params.category!.toLowerCase()
    );
    if (!match) {
      return { products: [], total: 0, totalPages: 1 };
    }
    categoryId = match.id;
  }

  const colorValues = params.color?.length ? params.color.map((c) => c.toLowerCase()).slice(0, 10) : undefined;
  const sizeValues = params.size?.length ? params.size.map((s) => s.toLowerCase()).slice(0, 10) : undefined;

  // At most one array-type facet becomes a real Firestore filter; any others
  // are refined in-memory below (same shape as the minRating refinement).
  let inMemoryColor: string[] | undefined;
  let inMemorySize: string[] | undefined;

  if (categoryId) {
    query = query.where("categoryIds", "array-contains", categoryId);
    inMemoryColor = colorValues;
    inMemorySize = sizeValues;
  } else if (colorValues) {
    query = query.where("colorFacets", "array-contains-any", colorValues);
    inMemorySize = sizeValues;
  } else if (sizeValues) {
    query = query.where("sizeFacets", "array-contains-any", sizeValues);
  }

  if (params.brand) {
    query = query.where("brandId", "==", params.brand);
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

  return safeQuery("searchProducts", { products: [], total: 0, totalPages: 1 }, async () => {
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

    if (inMemoryColor) {
      products = products.filter((p) => p.colorFacets?.some((c) => inMemoryColor!.includes(c.toLowerCase())));
    }
    if (inMemorySize) {
      products = products.filter((p) => p.sizeFacets?.some((s) => inMemorySize!.includes(s.toLowerCase())));
    }
    if (params.minRating != null) {
      products = products.filter((p) => (p.rating ?? 0) >= params.minRating!);
    }

    return { products, total, totalPages };
  });
}

// --- Admin ---

export async function getProductById(id: string): Promise<Product | null> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc(id).get();
  return docData<Product>(doc);
}

export interface AdminProductsCursor {
  /** nameLower (string) for the search branch, updatedAt millis (number) for the
   * default branch - whichever field that branch actually sorts by. */
  value: number | string;
  id: string;
}

export interface AdminProductSearchParams {
  q?: string;
  status?: "draft" | "active" | "archived";
  categoryId?: string;
  brandId?: string;
  trashed?: boolean; // true = only isDeleted docs, false/undefined = only non-deleted
  pageSize?: number;
  startAfter?: AdminProductsCursor;
}

export interface AdminProductSearchResult {
  products: Product[];
  total: number;
  hasMore: boolean;
}

/**
 * Cursor-paginated - startAfter(...) + limit(pageSize+1), never offset(). The two
 * mutually-exclusive branches (search vs default) sort by different fields (nameLower
 * asc vs updatedAt desc); neither is provably unique (many products can share a name or
 * be updated in the same instant), so both add an explicit document-ID tiebreaker
 * matching each branch's own sort direction - Firestore already appends `__name__` as an
 * implicit final index component to every query, so this doesn't change what the
 * existing indexes already support (verified empirically). Note: the `term + ""` range
 * upper-bound below is the pre-existing behavior (exact-match only, not a "starts with"
 * prefix search like this codebase's other search fields use) - preserved exactly as-is,
 * not fixed here, since that's a pre-existing correctness question unrelated to this
 * offset-to-cursor pagination change.
 */
export async function searchAdminProducts(
  params: AdminProductSearchParams
): Promise<AdminProductSearchResult> {
  const pageSize = params.pageSize ?? 20;

  const col = await tenantCollection(COLLECTION);
  let baseQuery: FirebaseFirestore.Query = col
    .where("isDeleted", "==", Boolean(params.trashed));

  if (params.status) {
    baseQuery = baseQuery.where("status", "==", params.status);
  }
  if (params.categoryId) {
    baseQuery = baseQuery.where("categoryIds", "array-contains", params.categoryId);
  }
  if (params.brandId) {
    baseQuery = baseQuery.where("brandId", "==", params.brandId);
  }

  const term = params.q?.trim().toLowerCase();
  const isSearch = !!term;
  if (term) {
    baseQuery = baseQuery
      .where("nameLower", ">=", term)
      .where("nameLower", "<=", term + "")
      .orderBy("nameLower", "asc")
      .orderBy(FieldPath.documentId(), "asc");
  } else {
    baseQuery = baseQuery.orderBy("updatedAt", "desc").orderBy(FieldPath.documentId(), "desc");
  }

  return safeQuery("searchAdminProducts", { products: [], total: 0, hasMore: false }, async () => {
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
    const products = snap.docs
      .slice(0, pageSize)
      .map((doc) => docData<Product>(doc))
      .filter((p): p is Product => p !== null);

    return { products, total, hasMore: snap.docs.length > pageSize };
  });
}

export async function getInventoryProducts(): Promise<Product[]> {
  return safeQuery("getInventoryProducts", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col
      .where("isDeleted", "==", false)
      .where("trackInventory", "==", true)
      .select("name", "sku", "stock", "lowStockThreshold")
      .get();

    return snap.docs
      .map((doc) => docData<Product>(doc))
      .filter((p): p is Product => p !== null)
      .sort((a, b) => a.stock - b.stock);
  });
}

export async function isSkuTaken(sku: string, excludeProductId?: string): Promise<boolean> {
  const col = await tenantCollection(COLLECTION);
  const snap = await col.where("sku", "==", sku).limit(2).get();
  return snap.docs.some((doc) => doc.id !== excludeProductId);
}

export async function searchProductsByName(q: string, limit = 24): Promise<Product[]> {
  const term = q.trim().toLowerCase();
  if (!term) return getProducts(limit);

  return safeQuery("searchProductsByName", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col
      .where("status", "==", "active")
      .where("isDeleted", "==", false)
      .where("nameLower", ">=", term)
      .where("nameLower", "<=", term + "")
      .limit(limit)
      .get();

    return snap.docs
      .map((doc) => docData<Product>(doc))
      .filter((p): p is Product => p !== null);
  });
}

/** For Super Admin store deletion, which needs an arbitrary store's product IDs (to join
 * against the storeId-less `reviews` collection) regardless of the current request's own
 * tenant - mirrors getDeploymentMetadataByStoreId()'s direct-by-id access. `.select()` with
 * no fields pulls document IDs only, no product data. */
export async function getProductIdsForStore(storeId: string): Promise<string[]> {
  const snap = await adminDb().collection("stores").doc(storeId).collection(COLLECTION).select().get();
  return snap.docs.map((doc) => doc.id);
}
