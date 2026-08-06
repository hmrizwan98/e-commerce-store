import "server-only";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData } from "./utils";
import type { OrderBulkOperation } from "@/types/order-bulk-operation";

const COLLECTION = "orderBulkOperations";

export async function getOrderBulkHistory(limit = 20): Promise<OrderBulkOperation[]> {
  const snap = await (await tenantCollection(COLLECTION)).orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs
    .map((doc) => docData<OrderBulkOperation>(doc))
    .filter((record): record is OrderBulkOperation => record !== null);
}
