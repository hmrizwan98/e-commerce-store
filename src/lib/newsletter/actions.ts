"use server";

import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { getCurrentTenant } from "@/lib/tenant/current";

export async function subscribeToNewsletter(email: string): Promise<{ ok: boolean; message: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const tenant = await getCurrentTenant();

  await adminDb()
    .collection("newsletterSubscribers")
    .doc(trimmed)
    .set({ email: trimmed, ...(tenant ? { storeId: tenant.id } : {}), subscribedAt: serverTimestamp() }, { merge: true });

  return { ok: true, message: "Thanks for subscribing!" };
}
