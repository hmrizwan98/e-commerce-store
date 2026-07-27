"use server";

import { requireAdmin } from "@/lib/firebase/require-admin";
import {
  getVisitorOverview,
  getFunnelOverview,
  getSalesOverview,
  getTrend,
  type DateRange,
} from "@/lib/firebase/repositories/analytics";

export async function fetchReportData(range: DateRange) {
  await requireAdmin();
  const [visitors, funnel, sales, trend] = await Promise.all([
    getVisitorOverview(range),
    getFunnelOverview(range),
    getSalesOverview(range),
    getTrend(range),
  ]);
  return { visitors, funnel, sales, trend };
}
