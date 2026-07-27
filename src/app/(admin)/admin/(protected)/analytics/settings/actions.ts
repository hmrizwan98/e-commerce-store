"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import type { AnalyticsSettings } from "@/types/site-settings";

export async function updateAnalyticsSettings(settings: AnalyticsSettings): Promise<void> {
  await requireAdmin();
  await adminDb().collection("siteSettings").doc("analytics").set(stripUndefined(settings), { merge: true });
  revalidatePath("/admin/analytics/settings");
  revalidatePath("/admin/analytics/marketing");
  revalidatePath("/", "layout");
}
