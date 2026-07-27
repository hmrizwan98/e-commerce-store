import "server-only";
import { adminDb } from "../admin";
import { docData } from "./utils";
import type { Review, ReviewStatus } from "@/types/review";

const COLLECTION = "reviews";

export async function getApprovedReviewsByProduct(
  productId: string,
  limit = 10
): Promise<Review[]> {
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
}

// --- Admin ---

export async function getAllReviewsForAdmin(status?: ReviewStatus): Promise<Review[]> {
  let query: FirebaseFirestore.Query = adminDb().collection(COLLECTION);
  if (status) {
    query = query.where("status", "==", status);
  }
  query = query.orderBy("createdAt", "desc").limit(100);
  const snap = await query.get();
  return snap.docs
    .map((doc) => docData<Review>(doc))
    .filter((r): r is Review => r !== null);
}
