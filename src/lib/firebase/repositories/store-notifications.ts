import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { docData, stripUndefined } from "./utils";
import { storeNotificationId } from "@/lib/notifications/store-notification-model";
import type { StoreNotification } from "@/types/store-notification";

/**
 * `stores/{storeId}/notifications` - tenant-scoped, Admin SDK only. Every function takes the
 * storeId explicitly; Store Admin callers pass the tenant from their verified session
 * (requireAdmin), never an id sent by the browser.
 */
const col = (storeId: string) => adminDb().collection("stores").doc(storeId).collection("notifications");

/** Queues the notification inside the caller's transaction (same commit as the decision).
 * `create` fails the whole transaction if it already exists, so a decision that somehow ran
 * twice can't double-notify. */
export function createStoreNotificationInTx(
  tx: FirebaseFirestore.Transaction,
  storeId: string,
  data: Omit<StoreNotification, "id" | "createdAt" | "updatedAt">
): string {
  const id = storeNotificationId(data.kind, data.refId, data.decision);
  tx.create(col(storeId).doc(id), {
    ...stripUndefined(data),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return id;
}

export async function listStoreNotifications(
  storeId: string,
  opts: { unreadOnly?: boolean; limit?: number } = {}
): Promise<StoreNotification[]> {
  let q: FirebaseFirestore.Query = col(storeId);
  if (opts.unreadOnly) q = q.where("read", "==", false);
  // Newest first, sorted in memory - a store gets a handful of these, no index needed.
  const snap = await q.limit(opts.limit ?? 100).get();
  return snap.docs
    .map((d) => docData<StoreNotification>(d))
    .filter((n): n is StoreNotification => n !== null)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

/** Unread notifications for the header badge / chime: ids + titles only. */
export async function getUnreadStoreNotificationSummary(
  storeId: string,
  limit = 20
): Promise<{ count: number; items: { id: string; title: string }[] }> {
  const snap = await col(storeId).where("read", "==", false).select("title", "createdAt").limit(limit).get();
  const items = snap.docs
    .map((d) => ({ id: d.id, title: String(d.get("title") ?? ""), at: d.get("createdAt")?.toMillis?.() ?? 0 }))
    .sort((a, b) => b.at - a.at)
    .map(({ id, title }) => ({ id, title }));
  return { count: items.length, items };
}

export async function setStoreNotificationRead(storeId: string, id: string, read: boolean): Promise<void> {
  // update() (not set) -> fails for an id that doesn't exist in THIS store.
  await col(storeId).doc(id).update({ read, updatedAt: FieldValue.serverTimestamp() });
}

export async function markAllStoreNotificationsRead(storeId: string): Promise<number> {
  const snap = await col(storeId).where("read", "==", false).limit(400).get();
  if (snap.empty) return 0;
  const batch = adminDb().batch();
  snap.docs.forEach((d) => batch.update(d.ref, { read: true, updatedAt: FieldValue.serverTimestamp() }));
  await batch.commit();
  return snap.size;
}
