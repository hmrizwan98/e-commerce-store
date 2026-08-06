import "server-only";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData } from "./utils";
import type { ProductBulkOperation } from "@/types/product-bulk-operation";

const COLLECTION = "productBulkOperations";

export async function getProductBulkHistory(limit = 20): Promise<ProductBulkOperation[]> {
  const snap = await (await tenantCollection(COLLECTION)).orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs
    .map((doc) => docData<ProductBulkOperation>(doc))
    .filter((record): record is ProductBulkOperation => record !== null);
}
