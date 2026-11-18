import "server-only";
import type { Firestore } from "firebase-admin/firestore";
import { docData } from "./utils";
import type { ContactSubmission } from "@/types/contact-submission";

/**
 * Store Admin inbox for the storefront contact form. Every function takes the store id from
 * the caller's verified session and filters/checks the `storeId` FIELD, so one store can
 * never list, read or change another store's messages (they share one root collection).
 */
const COLLECTION = "contactSubmissions";
export const INBOX_LIMIT = 500;

export async function listContactSubmissions(db: Firestore, storeId: string): Promise<ContactSubmission[]> {
  if (!storeId) return [];
  // Equality filter only (no composite index needed); newest first, sorted here.
  const snap = await db.collection(COLLECTION).where("storeId", "==", storeId).limit(INBOX_LIMIT).get();
  return snap.docs
    .map((d) => docData<ContactSubmission>(d))
    .filter((m): m is ContactSubmission => !!m && m.storeId === storeId)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export async function setContactSubmissionRead(db: Firestore, storeId: string, id: string, read: boolean): Promise<boolean> {
  if (!storeId || !id || id.includes("/")) return false;
  const ref = db.collection(COLLECTION).doc(id);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists || snap.data()?.storeId !== storeId) return false;
    tx.update(ref, { read, readAt: read ? Date.now() : null });
    return true;
  });
}

export async function markAllContactSubmissionsRead(db: Firestore, storeId: string): Promise<number> {
  const items = (await listContactSubmissions(db, storeId)).filter((m) => m.read !== true);
  const now = Date.now();
  for (let i = 0; i < items.length; i += 400) {
    const batch = db.batch();
    for (const m of items.slice(i, i + 400)) batch.update(db.collection(COLLECTION).doc(m.id), { read: true, readAt: now });
    await batch.commit();
  }
  return items.length;
}
