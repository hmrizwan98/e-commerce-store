"use server";

import { revalidatePath } from "next/cache";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import type { AnalyticsSettings } from "@/types/site-settings";

export async function updateAnalyticsSettings(settings: AnalyticsSettings): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("siteSettings");
  await col.doc("analytics").set(stripUndefined(settings), { merge: true });
  revalidatePath("/admin/analytics/settings");
  revalidatePath("/admin/analytics/marketing");
  revalidatePath("/", "layout");
}
