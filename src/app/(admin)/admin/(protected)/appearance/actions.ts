"use server";

import { requireAdmin } from "@/lib/firebase/require-admin";
import { saveDraftThemeConfig, setActiveThemeConfig, getActiveThemeConfig, getDraftThemeConfig } from "@/lib/theme/theme-repository";
import { revalidatePath } from "next/cache";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";

export async function saveThemeDraftAction(draftConfig: Partial<SystemThemeConfig>) {
  await requireAdmin();
  await saveDraftThemeConfig(draftConfig);
  revalidatePath("/", "layout");
  return { ok: true, message: "Theme draft saved successfully." };
}

export async function publishThemeAction() {
  await requireAdmin();
  const currentDraft = await getDraftThemeConfig();
  await setActiveThemeConfig(currentDraft);
  revalidatePath("/", "layout");
  return { ok: true, message: "Theme published to storefront live!" };
}

/**
 * "Activate" (without Publish): stages a preset as the draft only - the live
 * storefront is untouched until the merchant explicitly publishes from the
 * Theme Editor. Distinct from Activate & Publish (saveThemeDraftAction +
 * publishThemeAction back-to-back), which also pushes it live immediately.
 */
export async function activateThemeAction(draftConfig: Partial<SystemThemeConfig>) {
  await requireAdmin();
  await saveDraftThemeConfig(draftConfig);
  revalidatePath("/admin/appearance/customize");
  return { ok: true, message: "Theme staged as draft. Customize it, then Publish when ready." };
}

export async function resetThemeDraftAction() {
  await requireAdmin();
  const activeConfig = await getActiveThemeConfig();
  await saveDraftThemeConfig(activeConfig);
  revalidatePath("/", "layout");
  return { ok: true, message: "Draft reset to published theme state." };
}
