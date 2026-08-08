import "server-only";
import { adminDb } from "../admin";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import { getProductIdsForStore } from "./products";
import { getCurrentTenant } from "@/lib/tenant/current";
import type { Review, ReviewStatus } from "@/types/review";

const COLLECTION = "reviews";

export async function getApprovedReviewsByProduct(
  productId: string,
  limit = 10
): Promise<Review[]> {
  return safeQuery("getApprovedReviewsByProduct", [], async () => {
    const snap = await adminDb()
      .collection(COLLECTION)
      .where("productId", "==", productId)
      .where("status", "==", "approved")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snap.docs
      .map((doc) => docData<Review>(doc))
      .filter((r): r is Review => r !== null);
  });
}

/** Read-only - for the Customer CRM's analytics/timeline (Total Reviews, review
 * timeline entries). Reviews is a flat, non-tenant-scoped collection (documented,
 * accepted trade-off elsewhere) - this just queries it by the review's own userId. */
export async function getReviewsByUserId(userId: string, limit = 50): Promise<Review[]> {
  return safeQuery("getReviewsByUserId", [], async () => {
    const snap = await adminDb()
      .collection(COLLECTION)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snap.docs
      .map((doc) => docData<Review>(doc))
      .filter((r): r is Review => r !== null);
  });
}

// --- Admin ---

/**
 * `reviews` is root-level with no `storeId` field, so the only way to scope it to the
 * current tenant is the same indirect productId join `deleteReviewsForProducts()`
 * (superadmin actions.ts) already uses for store deletion: resolve this tenant's own
 * product IDs (a `.select()`-only query, no product data pulled), then query reviews by
 * `productId in [...]` in chunks of <=30 (Firestore's `in` limit). Without this, every
 * store's reviews were mixed together - see the fixed cross-tenant leak this replaces.
 */
export async function getAllReviewsForAdmin(status?: ReviewStatus): Promise<Review[]> {
  return safeQuery("getAllReviewsForAdmin", [], async () => {
    const tenant = await getCurrentTenant();
    if (!tenant) return [];

    const productIds = await getProductIdsForStore(tenant.id);
    if (!productIds.length) return [];

    const chunks: string[][] = [];
    for (let i = 0; i < productIds.length; i += 30) {
      chunks.push(productIds.slice(i, i + 30));
    }

    const snapshots = await Promise.all(
      chunks.map((chunk) => {
        let query: FirebaseFirestore.Query = adminDb().collection(COLLECTION).where("productId", "in", chunk);
        if (status) {
          query = query.where("status", "==", status);
        }
        return query.get();
      })
    );

    return snapshots
      .flatMap((snap) => snap.docs)
      .map((doc) => docData<Review>(doc))
      .filter((r): r is Review => r !== null)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
      .slice(0, 100);
  });
}
