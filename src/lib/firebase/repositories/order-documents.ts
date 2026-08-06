import "server-only";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { OrderDocument } from "@/types/order-document";

const COLLECTION = "orderDocuments";

export async function getOrderDocumentHistory(orderId: string, limit = 20): Promise<OrderDocument[]> {
  return safeQuery("getOrderDocumentHistory", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col.where("orderId", "==", orderId).orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs
      .map((doc) => docData<OrderDocument>(doc))
      .filter((record): record is OrderDocument => record !== null);
  });
}
