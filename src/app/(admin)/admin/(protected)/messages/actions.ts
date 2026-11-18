"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { adminDb } from "@/lib/firebase/admin";
import { markAllContactSubmissionsRead, setContactSubmissionRead } from "@/lib/firebase/repositories/contact-submissions";

type Result = { ok: true } | { ok: false; error: string };

/** Store id always comes from the verified admin session - never from the browser. */
export async function setMessageReadAction(id: string, read: boolean): Promise<Result> {
  const { tenantId } = await requireAdmin();
  const ok = await setContactSubmissionRead(adminDb(), tenantId, String(id), Boolean(read)).catch(() => false);
  if (!ok) return { ok: false, error: "Message not found." };
  revalidatePath("/admin/messages");
  return { ok: true };
}

export async function markAllMessagesReadAction(): Promise<Result> {
  const { tenantId } = await requireAdmin();
  try {
    await markAllContactSubmissionsRead(adminDb(), tenantId);
    revalidatePath("/admin/messages");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update messages." };
  }
}
