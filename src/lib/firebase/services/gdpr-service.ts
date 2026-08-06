import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import type { GdprRequest, GdprRequestType } from "@/types/gdpr-request";
import type { CustomerStatus } from "@/types/customer";

/** Queues a GdprRequest record - callers pass the customer's real (already
 * materialized) doc id. Architecture only for "data_export": no real data-package
 * generation engine exists yet. */
async function queueGdprRequest(customerId: string, type: GdprRequestType): Promise<string> {
  const col = await tenantCollection("gdprRequests");
  const ref = col.doc();
  await ref.set({
    customerId,
    type,
    status: "queued" satisfies GdprRequest["status"],
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function requestCustomerDataExport(customerId: string): Promise<void> {
  await queueGdprRequest(customerId, "data_export");
}

/** Soft-deletes the customer's own profile only - Orders/Reviews are legal/
 * business records and are explicitly not touched (out of scope, not modifiable
 * from this module). */
export async function requestCustomerDeletion(customerId: string): Promise<void> {
  await queueGdprRequest(customerId, "delete_request");
  const col = await tenantCollection("customers");
  await col.doc(customerId).update({ status: "deleted" satisfies CustomerStatus, updatedAt: FieldValue.serverTimestamp() });
}

export async function deactivateCustomer(customerId: string): Promise<void> {
  await queueGdprRequest(customerId, "deactivation");
  const col = await tenantCollection("customers");
  await col.doc(customerId).update({ status: "blocked" satisfies CustomerStatus, updatedAt: FieldValue.serverTimestamp() });
}
