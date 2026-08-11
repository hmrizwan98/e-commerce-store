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

export async function resetThemeDraftAction() {
  await requireAdmin();
  const activeConfig = await getActiveThemeConfig();
  await saveDraftThemeConfig(activeConfig);
  revalidatePath("/", "layout");
  return { ok: true, message: "Draft reset to published theme state." };
}
