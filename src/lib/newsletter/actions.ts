"use server";

import { adminDb, serverTimestamp } from "@/lib/firebase/admin";

export async function subscribeToNewsletter(email: string): Promise<{ ok: boolean; message: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    return { ok: false, message: "Enter a valid email address." };
  }

  await adminDb()
    .collection("newsletterSubscribers")
    .doc(trimmed)
    .set({ email: trimmed, subscribedAt: serverTimestamp() }, { merge: true });

  return { ok: true, message: "Thanks for subscribing!" };
}
