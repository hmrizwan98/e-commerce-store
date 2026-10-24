import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { docData, stripUndefined } from "./utils";
import type {
  SuperAdminNotification,
  SuperAdminNotificationStatus,
  SuperAdminNotificationType,
} from "@/types/superadmin-notification";

/** Platform-level (not tenant-scoped) - Admin SDK only; firestore.rules denies clients. */
const COLLECTION = "superAdminNotifications";

/** Deterministic id per underlying request -> the same request can never notify twice. */
export function notificationId(type: SuperAdminNotificationType, refId: string): string {
  return `${type}__${refId}`.replace(/[/]/g, "_");
}

export async function createSuperAdminNotification(input: {
  type: SuperAdminNotificationType;
  storeId: string;
  storeName: string;
  title: string;
  detail?: string;
  refId: string;
  href: string;
}): Promise<{ created: boolean }> {
  const ref = adminDb().collection(COLLECTION).doc(notificationId(input.type, input.refId));
  try {
    await ref.create({
      ...stripUndefined(input),
      status: "pending" satisfies SuperAdminNotificationStatus,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { created: true };
  } catch (err) {
    if ((err as { code?: number }).code === 6) return { created: false }; // ALREADY_EXISTS
    throw err;
  }
}

export async function setNotificationStatus(
  type: SuperAdminNotificationType,
  refId: string,
  status: SuperAdminNotificationStatus
): Promise<void> {
  const ref = adminDb().collection(COLLECTION).doc(notificationId(type, refId));
  await ref.set({ status, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function setNotificationRead(id: string, read: boolean): Promise<void> {
  await adminDb().collection(COLLECTION).doc(id).update({ read, updatedAt: FieldValue.serverTimestamp() });
}

export async function markAllNotificationsRead(): Promise<number> {
  const snap = await adminDb().collection(COLLECTION).where("read", "==", false).limit(400).get();
  if (snap.empty) return 0;
  const batch = adminDb().batch();
  snap.docs.forEach((d) => batch.update(d.ref, { read: true, updatedAt: FieldValue.serverTimestamp() }));
  await batch.commit();
  return snap.size;
}

export async function listSuperAdminNotifications(opts: {
  filter?: "all" | "unread" | SuperAdminNotificationStatus;
  limit?: number;
} = {}): Promise<SuperAdminNotification[]> {
  let q: FirebaseFirestore.Query = adminDb().collection(COLLECTION);
  if (opts.filter === "unread") q = q.where("read", "==", false);
  else if (opts.filter && opts.filter !== "all") q = q.where("status", "==", opts.filter);
  // Sorted in memory (newest first): avoids a composite index per filter for this small,
  // platform-level list.
  const snap = await q.limit(opts.limit ?? 200).get();
  return snap.docs
    .map((d) => docData<SuperAdminNotification>(d))
    .filter((n): n is SuperAdminNotification => n !== null)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

/** Unread ids + titles (newest first) for the bell badge / chime - capped, select()-only. */
export async function getUnreadNotificationSummary(limit = 20): Promise<{ count: number; items: { id: string; title: string }[] }> {
  const col = adminDb().collection(COLLECTION);
  const [countSnap, snap] = await Promise.all([
    col.where("read", "==", false).count().get(),
    col.where("read", "==", false).select("title", "createdAt").limit(limit).get(),
  ]);
  const items = snap.docs
    .map((d) => ({ id: d.id, title: String(d.get("title") ?? ""), at: d.get("createdAt")?.toMillis?.() ?? 0 }))
    .sort((a, b) => b.at - a.at)
    .map(({ id, title }) => ({ id, title }));
  return { count: countSnap.data().count, items };
}
