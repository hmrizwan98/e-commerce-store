import "server-only";
import { adminDb } from "../admin";
import { docData } from "./utils";
import type { FaqItem } from "@/types/faq";

const COLLECTION = "faqs";

export async function getActiveFaqs(): Promise<FaqItem[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("isActive", "==", true)
    .orderBy("order", "asc")
    .get();
  return snap.docs.map((doc) => docData<FaqItem>(doc)).filter((f): f is FaqItem => f !== null);
}

// --- Admin ---

export async function getFaqById(id: string): Promise<FaqItem | null> {
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  return docData<FaqItem>(doc);
}

export async function getAllFaqsForAdmin(): Promise<FaqItem[]> {
  const snap = await adminDb().collection(COLLECTION).orderBy("order", "asc").get();
  return snap.docs.map((doc) => docData<FaqItem>(doc)).filter((f): f is FaqItem => f !== null);
}
