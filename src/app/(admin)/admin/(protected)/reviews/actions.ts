"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/require-admin";
import type { Review } from "@/types/review";

async function recomputeProductRating(productId: string) {
  const snap = await adminDb()
    .collection("reviews")
    .where("productId", "==", productId)
    .where("status", "==", "approved")
    .get();

  const reviews = snap.docs.map((d) => d.data() as Review);
  const numberOfReviews = reviews.length;
  const rating = numberOfReviews
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / numberOfReviews
    : 0;

  await adminDb().collection("products").doc(productId).update({ rating, numberOfReviews });
}

export async function approveReview(id: string, productId: string): Promise<void> {
  await requireAdmin();
  await adminDb()
    .collection("reviews")
    .doc(id)
    .update({ status: "approved", updatedAt: FieldValue.serverTimestamp() });
  await recomputeProductRating(productId);
  revalidatePath("/admin/reviews");
  revalidatePath("/product", "layout");
}

export async function rejectReview(id: string, productId: string): Promise<void> {
  await requireAdmin();
  await adminDb()
    .collection("reviews")
    .doc(id)
    .update({ status: "rejected", updatedAt: FieldValue.serverTimestamp() });
  await recomputeProductRating(productId);
  revalidatePath("/admin/reviews");
  revalidatePath("/product", "layout");
}

export async function deleteReview(id: string, productId: string): Promise<void> {
  await requireAdmin();
  await adminDb().collection("reviews").doc(id).delete();
  await recomputeProductRating(productId);
  revalidatePath("/admin/reviews");
  revalidatePath("/product", "layout");
}
