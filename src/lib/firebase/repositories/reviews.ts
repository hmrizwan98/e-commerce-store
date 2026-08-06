import "server-only";
import { adminDb } from "../admin";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
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

export async function getAllReviewsForAdmin(status?: ReviewStatus): Promise<Review[]> {
  return safeQuery("getAllReviewsForAdmin", [], async () => {
    let query: FirebaseFirestore.Query = adminDb().collection(COLLECTION);
    if (status) {
      query = query.where("status", "==", status);
    }
    query = query.orderBy("createdAt", "desc").limit(100);
    const snap = await query.get();
    return snap.docs
      .map((doc) => docData<Review>(doc))
      .filter((r): r is Review => r !== null);
  });
}
