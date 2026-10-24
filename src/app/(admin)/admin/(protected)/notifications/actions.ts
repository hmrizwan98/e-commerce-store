"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { markAllStoreNotificationsRead, setStoreNotificationRead } from "@/lib/firebase/repositories/store-notifications";

type Result = { ok: true } | { ok: false; error: string };

/** Store id always comes from the verified session (requireAdmin also checks it matches
 * this host's store) - a browser can't point these at another store's notifications. */
export async function setStoreNotificationReadAction(id: string, read: boolean): Promise<Result> {
  const { tenantId } = await requireAdmin();
  try {
    await setStoreNotificationRead(tenantId, String(id), Boolean(read));
    revalidatePath("/admin/notifications");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update the notification." };
  }
}

export async function markAllStoreNotificationsReadAction(): Promise<Result> {
  const { tenantId } = await requireAdmin();
  try {
    await markAllStoreNotificationsRead(tenantId);
    revalidatePath("/admin/notifications");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update notifications." };
  }
}
