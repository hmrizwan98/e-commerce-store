import "server-only";
import { adminDb, serverTimestamp } from "../admin";
import { stripUndefined, docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { StoreActivityLog, StoreActivityAction } from "@/types/store-activity-log";

const COLLECTION = "storeActivityLogs";

/** Top-level (not tenant-scoped) - this is Super Admin audit metadata about a store,
 * not the store's own data, and needs to be queryable/writable without a resolved
 * tenant context. Admin-SDK-only, denied to clients in firestore.rules (like rateLimits). */
export async function logStoreActivity(
  storeId: string,
  action: StoreActivityAction,
  actorUid: string,
  meta?: Record<string, string>
): Promise<void> {
  await adminDb()
    .collection(COLLECTION)
    .add({
      ...stripUndefined({ storeId, action, actorUid, meta }),
      createdAt: serverTimestamp(),
    });
}

export async function getRecentActivity(storeId: string, limit = 10): Promise<StoreActivityLog[]> {
  return safeQuery("getRecentActivity", [], async () => {
    const snap = await adminDb()
      .collection(COLLECTION)
      .where("storeId", "==", storeId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snap.docs
      .map((doc) => docData<StoreActivityLog>(doc))
      .filter((log): log is StoreActivityLog => log !== null);
  });
}
