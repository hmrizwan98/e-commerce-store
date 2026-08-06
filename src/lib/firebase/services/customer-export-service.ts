import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import type { CustomerExportOperation, CustomerExportFormat } from "@/types/customer-export-operation";

/**
 * Architecture only - queues a CustomerExportOperation record and returns immediately.
 * No real CSV/Excel generation engine exists yet; a future phase would pick up
 * "queued" records and perform the real export. Mirrors product-bulk-service.ts's
 * exact shape.
 */
export async function queueCustomerExport(format: CustomerExportFormat, note?: string): Promise<string> {
  const col = await tenantCollection("customerExportOperations");
  const ref = col.doc();
  await ref.set({
    format,
    status: "queued" satisfies CustomerExportOperation["status"],
    ...(note ? { note } : {}),
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}
