import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { stripUndefined, docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { OrderActivityLog, OrderActivityAction } from "@/types/order-activity-log";

const COLLECTION = "orderActivityLogs";

/** Mirrors product-activity-logs.ts's exact shape, tenant-scoped
 * (stores/{id}/orderActivityLogs) rather than a Super-Admin-global collection. */
export async function logOrderActivity(
  orderId: string,
  action: OrderActivityAction,
  actorUid: string,
  meta?: Record<string, string>
): Promise<void> {
  const col = await tenantCollection(COLLECTION);
  await col.add({
    ...stripUndefined({ orderId, action, actorUid, meta }),
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function getRecentOrderActivity(orderId: string, limit = 10): Promise<OrderActivityLog[]> {
  return safeQuery("getRecentOrderActivity", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col.where("orderId", "==", orderId).orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs
      .map((doc) => docData<OrderActivityLog>(doc))
      .filter((log): log is OrderActivityLog => log !== null);
  });
}
