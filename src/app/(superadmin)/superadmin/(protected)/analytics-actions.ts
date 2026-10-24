"use server";

import { requireSuperAdmin } from "@/lib/firebase/require-super-admin";
import { getPlatformAnalytics, type AnalyticsRange, type PlatformAnalytics } from "@/lib/finance/platform-analytics-service";

/** Super Admin only - platform-wide revenue/commission across every store. */
export async function getPlatformAnalyticsAction(
  range: AnalyticsRange,
  storeId: string | null
): Promise<{ ok: true; data: PlatformAnalytics } | { ok: false; error: string }> {
  await requireSuperAdmin();
  try {
    return { ok: true, data: await getPlatformAnalytics({ range, storeId }) };
  } catch (err) {
    console.error("[analytics] failed", err);
    return { ok: false, error: "Couldn't load analytics. Retrying shortly." };
  }
}
