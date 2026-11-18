/**
 * Document ids for the root `newsletterSubscribers` collection.
 *
 * Originally the id was just the email, so the same email subscribing on two stores overwrote
 * the first store's `storeId` (the first store silently lost the subscriber). Store
 * subscriptions now get one document per store+email. Existing email-keyed documents are kept
 * as they are and still count for their store (queries use the `storeId` field) - nothing is
 * migrated or deleted.
 */

export function normalizeNewsletterEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  // "/" would make an invalid Firestore document path; emails don't need it.
  if (!trimmed || !trimmed.includes("@") || trimmed.includes("/") || trimmed.length > 254) return null;
  return trimmed;
}

/** Per-store document id for a store's subscriber. */
export function storeNewsletterDocId(storeId: string, email: string): string {
  return `${storeId}__${email}`;
}

/** Platform (no store) subscription id - never the legacy email doc when that one belongs to a store. */
export function platformNewsletterDocId(email: string, legacyDocStoreId: string | null | undefined): string {
  return legacyDocStoreId ? `platform__${email}` : email;
}

/**
 * Which document a subscription is written to:
 * - a legacy email-keyed doc that already belongs to THIS store is reused (no duplicate);
 * - otherwise the per-store id, so another store's legacy doc is never touched.
 */
export function resolveNewsletterDocId(input: {
  email: string;
  storeId: string | null;
  /** storeId of the existing legacy doc `newsletterSubscribers/{email}`; undefined = no such doc. */
  legacyDocStoreId?: string | null;
  legacyDocExists: boolean;
}): string {
  if (!input.storeId) return platformNewsletterDocId(input.email, input.legacyDocStoreId);
  if (input.legacyDocExists && input.legacyDocStoreId === input.storeId) return input.email;
  return storeNewsletterDocId(input.storeId, input.email);
}
