import "server-only";
import { adminDb } from "../admin";
import { getCurrentTenant } from "@/lib/tenant/current";
import { normalizeNewsletterEmail, storeNewsletterDocId } from "@/lib/newsletter/subscriber-id";

/** newsletterSubscribers is a root-level collection (not tenant-scoped by path) with a storeId
 * field. Documents are keyed per store + email (older ones by email only - still honoured
 * when they belong to this store). Used by the Customer CRM's "Newsletter" segment. */
export async function isNewsletterSubscriber(email: string): Promise<boolean> {
  const tenant = await getCurrentTenant();
  if (!tenant) return false;
  const normalized = normalizeNewsletterEmail(email);
  if (!normalized) return false;
  const col = adminDb().collection("newsletterSubscribers");
  const [perStore, legacy] = await Promise.all([
    col.doc(storeNewsletterDocId(tenant.id, normalized)).get(),
    col.doc(normalized).get(),
  ]);
  if (perStore.exists && perStore.data()?.storeId === tenant.id) return true;
  return legacy.exists && legacy.data()?.storeId === tenant.id;
}
