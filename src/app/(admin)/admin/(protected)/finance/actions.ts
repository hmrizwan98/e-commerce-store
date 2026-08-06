"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { queueFinanceReport } from "@/lib/firebase/services/finance-report-service";

export async function requestFinanceReport(periodFrom?: number, periodTo?: number, note?: string): Promise<void> {
  await requireAdmin();
  await queueFinanceReport(periodFrom, periodTo, note);
  revalidatePath("/admin/finance");
}
