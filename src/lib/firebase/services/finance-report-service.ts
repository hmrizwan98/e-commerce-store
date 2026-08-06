import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import type { FinanceReport } from "@/types/finance-report";

/**
 * Architecture only - queues a FinanceReport record and returns immediately. No real
 * report-generation engine exists yet; a future phase would pick up "queued" records and
 * produce the actual report. Mirrors product-bulk-service.ts's exact shape.
 */
export async function queueFinanceReport(periodFrom?: number, periodTo?: number, note?: string): Promise<string> {
  const col = await tenantCollection("financeReports");
  const ref = col.doc();
  await ref.set({
    status: "queued" satisfies FinanceReport["status"],
    ...(periodFrom ? { periodFrom } : {}),
    ...(periodTo ? { periodTo } : {}),
    ...(note ? { note } : {}),
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}
