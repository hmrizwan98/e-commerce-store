import "server-only";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { GdprRequest } from "@/types/gdpr-request";

const COLLECTION = "gdprRequests";

export async function getGdprRequestHistory(customerId: string, limit = 20): Promise<GdprRequest[]> {
  return safeQuery("getGdprRequestHistory", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col.where("customerId", "==", customerId).orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs
      .map((doc) => docData<GdprRequest>(doc))
      .filter((r): r is GdprRequest => r !== null);
  });
}
