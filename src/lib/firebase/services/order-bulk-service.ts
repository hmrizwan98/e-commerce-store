import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import type { OrderBulkOperation, OrderBulkOperationType } from "@/types/order-bulk-operation";

/**
 * Architecture only - queues an OrderBulkOperation record and returns immediately. No real
 * CSV export engine exists yet; a future phase would pick up "queued" records and perform
 * the real export. Mirrors product-bulk-service.ts's exact shape.
 */
async function queueOrderBulkOperation(
  type: OrderBulkOperationType,
  opts?: { note?: string }
): Promise<string> {
  const col = await tenantCollection("orderBulkOperations");
  const ref = col.doc();
  await ref.set({
    type,
    status: "queued" satisfies OrderBulkOperation["status"],
    ...(opts?.note ? { note: opts.note } : {}),
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function queueOrderExport(note?: string): Promise<string> {
  return queueOrderBulkOperation("export", { note });
}
