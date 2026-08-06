import "server-only";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData } from "./utils";
import type { FinanceReport } from "@/types/finance-report";

const COLLECTION = "financeReports";

export async function getFinanceReportHistory(limit = 20): Promise<FinanceReport[]> {
  const snap = await (await tenantCollection(COLLECTION)).orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs
    .map((doc) => docData<FinanceReport>(doc))
    .filter((record): record is FinanceReport => record !== null);
}
