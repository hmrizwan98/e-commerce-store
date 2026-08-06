export type FinanceReportStatus = "queued" | "completed" | "failed";

/** Architecture only - no report-generation engine exists yet (see
 * src/lib/firebase/services/finance-report-service.ts). Mirrors ProductBulkOperation's
 * shape - a record is created the moment a request is made and stays "queued" until a
 * future phase implements the actual report generation. */
export interface FinanceReport {
  id: string;
  status: FinanceReportStatus;
  periodFrom?: number;
  periodTo?: number;
  note?: string;
  createdAt?: number;
}
