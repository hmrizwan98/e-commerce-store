"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import type { Review } from "@/types/review";

/**
 * Updates a review's status (or deletes it) and recomputes the product's denormalized
 * rating/numberOfReviews in one Firestore transaction, so two admins moderating different
 * reviews for the same product concurrently can't have one recompute silently clobber the
 * other's contribution (the old sequential read-then-write had exactly that race).
 */
async function updateReviewAndRecomputeRating(
  reviewId: string,
  productId: string,
  patch: { status: "approved" | "rejected" } | { delete: true }
): Promise<void> {
  const reviewsCol = adminDb().collection("reviews");
  const reviewRef = reviewsCol.doc(reviewId);
  const productsCol = await tenantCollection("products");
  const productRef = productsCol.doc(productId);

  await adminDb().runTransaction(async (tx) => {
    const approvedSnap = await tx.get(
      reviewsCol.where("productId", "==", productId).where("status", "==", "approved")
    );
    let reviews = approvedSnap.docs.filter((d) => d.id !== reviewId).map((d) => d.data() as Review);

    if ("status" in patch && patch.status === "approved") {
      const reviewDoc = await tx.get(reviewRef);
      const reviewData = reviewDoc.data() as Review | undefined;
      if (reviewData) reviews = [...reviews, reviewData];
    }

    const numberOfReviews = reviews.length;
    const rating = numberOfReviews ? reviews.reduce((sum, r) => sum + r.rating, 0) / numberOfReviews : 0;

    if ("delete" in patch) {
      tx.delete(reviewRef);
    } else {
      tx.update(reviewRef, { status: patch.status, updatedAt: FieldValue.serverTimestamp() });
    }
    tx.update(productRef, { rating, numberOfReviews });
  });
}

export async function approveReview(id: string, productId: string): Promise<void> {
  await requireAdmin();
  await updateReviewAndRecomputeRating(id, productId, { status: "approved" });
  revalidatePath("/admin/reviews");
  revalidatePath("/product", "layout");
}

export async function rejectReview(id: string, productId: string): Promise<void> {
  await requireAdmin();
  await updateReviewAndRecomputeRating(id, productId, { status: "rejected" });
  revalidatePath("/admin/reviews");
  revalidatePath("/product", "layout");
}

export async function deleteReview(id: string, productId: string): Promise<void> {
  await requireAdmin();
  await updateReviewAndRecomputeRating(id, productId, { delete: true });
  revalidatePath("/admin/reviews");
  revalidatePath("/product", "layout");
}
