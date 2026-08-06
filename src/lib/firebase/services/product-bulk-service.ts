import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import type { ProductBulkOperation, ProductBulkOperationType } from "@/types/product-bulk-operation";

/**
 * Architecture only - queues a ProductBulkOperation record and returns immediately. No real
 * CSV parsing/file read-write engine exists yet; a future phase would pick up "queued"
 * records and perform the real import/export. Mirrors backup-service.ts's exact shape.
 */
async function queueProductBulkOperation(
  type: ProductBulkOperationType,
  opts?: { fileName?: string; note?: string }
): Promise<string> {
  const col = await tenantCollection("productBulkOperations");
  const ref = col.doc();
  await ref.set({
    type,
    status: "queued" satisfies ProductBulkOperation["status"],
    ...(opts?.fileName ? { fileName: opts.fileName } : {}),
    ...(opts?.note ? { note: opts.note } : {}),
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function queueProductExport(note?: string): Promise<string> {
  return queueProductBulkOperation("export", { note });
}

export async function queueProductImport(fileName?: string, note?: string): Promise<string> {
  return queueProductBulkOperation("import", { fileName, note });
}
