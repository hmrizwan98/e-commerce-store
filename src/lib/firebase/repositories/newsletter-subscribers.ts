import "server-only";
import { adminDb } from "../admin";
import { getCurrentTenant } from "@/lib/tenant/current";

/** newsletterSubscribers is a root-level collection (not tenant-scoped by path,
 * keyed by email) with a storeId field - see the Enterprise Platform Hardening
 * pass. Used by the Customer CRM's "Newsletter" segment. */
export async function isNewsletterSubscriber(email: string): Promise<boolean> {
  const tenant = await getCurrentTenant();
  if (!tenant) return false;
  const doc = await adminDb().collection("newsletterSubscribers").doc(email.toLowerCase()).get();
  if (!doc.exists) return false;
  return doc.data()?.storeId === tenant.id;
}
