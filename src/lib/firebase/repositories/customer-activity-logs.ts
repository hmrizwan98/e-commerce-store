import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { stripUndefined, docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { CustomerActivityLog, CustomerActivityAction } from "@/types/customer-activity-log";

const COLLECTION = "customerActivityLogs";

/** Mirrors order-activity-logs.ts's exact shape, tenant-scoped
 * (stores/{id}/customerActivityLogs) rather than a Super-Admin-global collection. */
export async function logCustomerActivity(
  customerId: string,
  action: CustomerActivityAction,
  actorUid: string,
  meta?: Record<string, string>
): Promise<void> {
  const col = await tenantCollection(COLLECTION);
  await col.add({
    ...stripUndefined({ customerId, action, actorUid, meta }),
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function getRecentCustomerActivity(customerId: string, limit = 20): Promise<CustomerActivityLog[]> {
  return safeQuery("getRecentCustomerActivity", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col.where("customerId", "==", customerId).orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs
      .map((doc) => docData<CustomerActivityLog>(doc))
      .filter((log): log is CustomerActivityLog => log !== null);
  });
}
