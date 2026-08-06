import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import type { OrderDocument, OrderDocumentType } from "@/types/order-document";

/**
 * Architecture only - queues an OrderDocument record and returns immediately. No real
 * PDF rendering engine exists yet; a future phase would pick up "queued" records and
 * generate the actual invoice/packing-slip/shipping-label file. Mirrors
 * product-bulk-service.ts's exact shape.
 */
async function queueOrderDocument(
  orderId: string,
  type: OrderDocumentType,
  opts?: { fileName?: string; note?: string }
): Promise<string> {
  const col = await tenantCollection("orderDocuments");
  const ref = col.doc();
  await ref.set({
    orderId,
    type,
    status: "queued" satisfies OrderDocument["status"],
    ...(opts?.fileName ? { fileName: opts.fileName } : {}),
    ...(opts?.note ? { note: opts.note } : {}),
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function queueInvoice(orderId: string, note?: string): Promise<string> {
  return queueOrderDocument(orderId, "invoice", { note });
}

export async function queuePackingSlip(orderId: string, note?: string): Promise<string> {
  return queueOrderDocument(orderId, "packing_slip", { note });
}

export async function queueShippingLabel(orderId: string, note?: string): Promise<string> {
  return queueOrderDocument(orderId, "shipping_label", { note });
}
