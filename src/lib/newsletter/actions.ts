"use server";

import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { getCurrentTenant } from "@/lib/tenant/current";
import { normalizeNewsletterEmail, resolveNewsletterDocId } from "./subscriber-id";

export async function subscribeToNewsletter(email: string): Promise<{ ok: boolean; message: string }> {
  const normalized = normalizeNewsletterEmail(email);
  if (!normalized) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const tenant = await getCurrentTenant();
  const col = adminDb().collection("newsletterSubscribers");

  // One document per store + email (see subscriber-id.ts); an older email-keyed doc that
  // already belongs to this store is reused, and one belonging to another store is never touched.
  const legacy = await col.doc(normalized).get();
  const docId = resolveNewsletterDocId({
    email: normalized,
    storeId: tenant?.id ?? null,
    legacyDocExists: legacy.exists,
    legacyDocStoreId: legacy.exists ? (legacy.data()?.storeId as string | undefined) ?? null : undefined,
  });

  await col
    .doc(docId)
    .set({ email: normalized, ...(tenant ? { storeId: tenant.id } : {}), subscribedAt: serverTimestamp() }, { merge: true });

  return { ok: true, message: "Thanks for subscribing!" };
}
