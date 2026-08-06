import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { stripUndefined, docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { ProductActivityLog, ProductActivityAction } from "@/types/product-activity-log";

const COLLECTION = "productActivityLogs";

/** Mirrors store-activity-logs.ts's shape, but tenant-scoped (stores/{id}/productActivityLogs)
 * rather than the Super-Admin-global top-level collection that one uses. */
export async function logProductActivity(
  productId: string,
  action: ProductActivityAction,
  actorUid: string,
  meta?: Record<string, string>
): Promise<void> {
  const col = await tenantCollection(COLLECTION);
  await col.add({
    ...stripUndefined({ productId, action, actorUid, meta }),
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function getRecentProductActivity(productId: string, limit = 10): Promise<ProductActivityLog[]> {
  return safeQuery("getRecentProductActivity", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col.where("productId", "==", productId).orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs
      .map((doc) => docData<ProductActivityLog>(doc))
      .filter((log): log is ProductActivityLog => log !== null);
  });
}
