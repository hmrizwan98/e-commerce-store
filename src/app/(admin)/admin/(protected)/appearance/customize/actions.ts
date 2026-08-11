"use server";

import { requireAdmin } from "@/lib/firebase/require-admin";
import {
  saveDraftThemeConfig,
  setActiveThemeConfig,
  getActiveThemeConfig,
  getDraftThemeConfig,
} from "@/lib/theme/theme-repository";
import { revalidatePath } from "next/cache";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";

/** Persists the customizer's in-memory draft. Never touches the live storefront. */
export async function saveCustomizerDraftAction(draftConfig: Partial<SystemThemeConfig>) {
  await requireAdmin();
  await saveDraftThemeConfig(draftConfig);
  revalidatePath("/admin/appearance/customize/preview");
  return { ok: true as const };
}

/** Publishes whatever is currently saved as the draft. Callers must save the draft first. */
export async function publishCustomizerAction() {
  await requireAdmin();
  const currentDraft = await getDraftThemeConfig();
  await setActiveThemeConfig(currentDraft);
  revalidatePath("/", "layout");
  revalidatePath("/admin/appearance/customize/preview");
  return { ok: true as const };
}

/** Overwrites the draft with the currently-published config - the customizer's "Discard" action. */
export async function discardCustomizerDraftAction() {
  await requireAdmin();
  const activeConfig = await getActiveThemeConfig();
  await saveDraftThemeConfig(activeConfig);
  revalidatePath("/admin/appearance/customize/preview");
  return { ok: true as const, config: activeConfig };
}
