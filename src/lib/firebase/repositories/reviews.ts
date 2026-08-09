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

/** K-way merge helper to combine sorted chunk arrays into top `limit` items (newest-first, stable tiebreaker). */
function kWayMergeReviews(chunkResults: Review[][], limit = 100): Review[] {

  const pointers = new Array(chunkResults.length).fill(0);
  const result: Review[] = [];

  while (result.length < limit) {
    let bestChunkIndex = -1;
    let bestReview: Review | null = null;

    for (let i = 0; i < chunkResults.length; i++) {
      const pointer = pointers[i];
      if (pointer < chunkResults[i].length) {
        const candidate = chunkResults[i][pointer];
        if (!bestReview) {
          bestReview = candidate;
          bestChunkIndex = i;
        } else {
          const candidateTime = candidate.createdAt ?? 0;
          const bestTime = bestReview.createdAt ?? 0;
          if (candidateTime > bestTime) {
            bestReview = candidate;
            bestChunkIndex = i;
          } else if (candidateTime === bestTime && candidate.id.localeCompare(bestReview.id) > 0) {
            bestReview = candidate;
            bestChunkIndex = i;
          }
        }
      }
    }

    if (bestChunkIndex === -1 || !bestReview) {
      break; // All chunks exhausted
    }

    result.push(bestReview);
    pointers[bestChunkIndex]++;
  }

  return result;
}

/**
 * `reviews` is root-level with no `storeId` field, so the only way to scope it to the
 * current tenant is the same indirect productId join `deleteReviewsForProducts()`
 * (superadmin actions.ts) already uses for store deletion: resolve this tenant's own
 * product IDs (a `.select()`-only query, no product data pulled), then query reviews by
 * `productId in [...]` in chunks of <=30 (Firestore's `in` limit).
 *
 * Optimized to limit each chunk query to 100 newest items and k-way merge results,
 * avoiding over-reading thousands of historical reviews when only top 100 are returned.
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
      chunks.map(async (chunk) => {
        let query: FirebaseFirestore.Query = adminDb()
          .collection(COLLECTION)
          .where("productId", "in", chunk);

        if (status) {
          query = query.where("status", "==", status).orderBy("createdAt", "desc").limit(100);
        }

        try {
          if (!status) {
            query = query.orderBy("createdAt", "desc").limit(100);
          }
          return await query.get();
        } catch (err: any) {
          if (!status && err?.code === 9) {
            // Fallback if (productId, createdAt) index is missing in local environment
            const fallbackQuery = adminDb().collection(COLLECTION).where("productId", "in", chunk);
            return await fallbackQuery.get();
          }
          throw err;
        }
      })
    );

    const chunkReviews = snapshots.map((snap) =>
      snap.docs
        .map((doc) => docData<Review>(doc))
        .filter((r): r is Review => r !== null)
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0) || b.id.localeCompare(a.id))
    );

    return kWayMergeReviews(chunkReviews, 100);
  });
}

