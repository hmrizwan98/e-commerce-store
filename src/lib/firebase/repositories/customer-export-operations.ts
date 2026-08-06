import "server-only";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData } from "./utils";
import type { CustomerExportOperation } from "@/types/customer-export-operation";

const COLLECTION = "customerExportOperations";

export async function getCustomerExportHistory(limit = 20): Promise<CustomerExportOperation[]> {
  const snap = await (await tenantCollection(COLLECTION)).orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs
    .map((doc) => docData<CustomerExportOperation>(doc))
    .filter((record): record is CustomerExportOperation => record !== null);
}
