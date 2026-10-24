"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireSuperAdmin } from "@/lib/firebase/require-super-admin";
import { docData } from "@/lib/firebase/repositories/utils";
import {
  countUnreadNotifications,
  markAllNotificationsRead,
  setNotificationRead,
} from "@/lib/firebase/repositories/superadmin-notifications";
import type { SuperAdminNotification } from "@/types/superadmin-notification";
import type { BackupRecord, BackupRecordStatus } from "@/types/backup-record";

type Result = { ok: true } | { ok: false; error: string };

export async function getUnreadNotificationCountAction(): Promise<number> {
  await requireSuperAdmin();
  return countUnreadNotifications().catch(() => 0);
}

export async function setNotificationReadAction(id: string, read: boolean): Promise<Result> {
  await requireSuperAdmin();
  try {
    await setNotificationRead(String(id), Boolean(read));
    revalidatePath("/superadmin/notifications");
    return { ok: true };
  } catch (err) {
    console.error("[notifications] read toggle failed", err);
    return { ok: false, error: "Could not update the notification." };
  }
}

export async function markAllNotificationsReadAction(): Promise<Result> {
  await requireSuperAdmin();
  await markAllNotificationsRead();
  revalidatePath("/superadmin/notifications");
  return { ok: true };
}

/** Allowed backup request transitions. "completed" must only be set once the backup was
 * actually produced (there is no automatic backup engine yet). */
const NEXT: Record<string, BackupRecordStatus[]> = {
  queued: ["approved", "rejected"],
  approved: ["completed", "rejected"],
};

export async function resolveBackupRequestAction(
  notificationId: string,
  decision: "approved" | "rejected" | "completed",
  note?: string
): Promise<Result> {
  const decoded = await requireSuperAdmin();
  try {
    const notifRef = adminDb().collection("superAdminNotifications").doc(String(notificationId));
    const notif = docData<SuperAdminNotification>(await notifRef.get());
    if (!notif || notif.type !== "backup_request") return { ok: false, error: "Backup request not found." };
    const backupId = notif.refId.split("__")[1];
    if (!backupId) return { ok: false, error: "Backup request reference is invalid." };
    const backupRef = adminDb().collection("stores").doc(notif.storeId).collection("backupHistory").doc(backupId);
    const cleanNote = (note ?? "").trim().slice(0, 500);
    await adminDb().runTransaction(async (tx) => {
      const backup = docData<BackupRecord>(await tx.get(backupRef));
      if (!backup) throw new Error("Backup request no longer exists.");
      if (!(NEXT[backup.status] ?? []).includes(decision)) {
        throw new Error(`Can't change a ${backup.status} request to ${decision}.`);
      }
      tx.update(backupRef, {
        status: decision,
        ...(cleanNote ? { resolutionNote: cleanNote } : {}),
        resolvedBy: decoded.email || decoded.uid,
        updatedAt: FieldValue.serverTimestamp(),
      });
      tx.update(notifRef, { status: decision, read: true, updatedAt: FieldValue.serverTimestamp() });
    });
    revalidatePath("/superadmin/notifications");
    return { ok: true };
  } catch (err) {
    if (err instanceof Error && /^(Backup request|Can't change)/.test(err.message)) return { ok: false, error: err.message };
    console.error("[notifications] backup decision failed", err);
    return { ok: false, error: "Could not update the backup request." };
  }
}
