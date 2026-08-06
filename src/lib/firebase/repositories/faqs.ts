import "server-only";
import { tenantCollection } from "../tenant-scope";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { FaqItem } from "@/types/faq";

const COLLECTION = "faqs";

export async function getActiveFaqs(): Promise<FaqItem[]> {
  return safeQuery("getActiveFaqs", [], async () => {
    const snap = await (await tenantCollection(COLLECTION))
      .where("isActive", "==", true)
      .orderBy("order", "asc")
      .get();
    return snap.docs.map((doc) => docData<FaqItem>(doc)).filter((f): f is FaqItem => f !== null);
  });
}

// --- Admin ---

export async function getFaqById(id: string): Promise<FaqItem | null> {
  const doc = await (await tenantCollection(COLLECTION)).doc(id).get();
  return docData<FaqItem>(doc);
}

export async function getAllFaqsForAdmin(): Promise<FaqItem[]> {
  const snap = await (await tenantCollection(COLLECTION)).orderBy("order", "asc").get();
  return snap.docs.map((doc) => docData<FaqItem>(doc)).filter((f): f is FaqItem => f !== null);
}
