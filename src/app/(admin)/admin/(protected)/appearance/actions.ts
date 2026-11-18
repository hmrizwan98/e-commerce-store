"use server";

import { requireAdmin } from "@/lib/firebase/require-admin";
import {
  saveDraftThemeConfig,
  setActiveThemeConfig,
  getActiveThemeConfig,
  getDraftThemeConfig,
  clearSectionStaging,
  saveThemeLogos,
  applyPopupForCurrentStore,
} from "@/lib/theme/theme-repository";
import { withoutSectionStaging } from "@/lib/theme/theme-safety";
import type { ThemeLogos } from "@/types/theme";
import { revalidatePath } from "next/cache";
import type { SystemThemeConfig, PopupThemeConfig } from "@/lib/theme/theme-types";

export async function saveThemeDraftAction(draftConfig: Partial<SystemThemeConfig>) {
  await requireAdmin();
  await saveDraftThemeConfig(draftConfig);
  revalidatePath("/", "layout");
  return { ok: true, message: "Theme draft saved successfully." };
}

export async function publishThemeAction() {
  await requireAdmin();
  const currentDraft = await getDraftThemeConfig();
  // Theme settings only - homepage sections are published from the Customizer (non-destructive
  // path); the section staging copy never goes into the live theme doc.
  await setActiveThemeConfig(withoutSectionStaging(currentDraft as unknown as Record<string, unknown>) as Partial<SystemThemeConfig>);
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
  await saveDraftThemeConfig(withoutSectionStaging(activeConfig as unknown as Record<string, unknown>) as Partial<SystemThemeConfig>);
  await clearSectionStaging(["draft"]);
  revalidatePath("/", "layout");
  return { ok: true, message: "Draft reset to published theme state." };
}

/** Store logos (onboarding, etc.) -> the canonical theme docs (draft + live), only the given keys. */
export async function saveThemeLogosAction(logos: Partial<ThemeLogos>) {
  await requireAdmin();
  await saveThemeLogos(logos);
  revalidatePath("/", "layout");
  return { ok: true as const };
}

/**
 * Popups & Modals page - popup-only operations. Only the `popup` field of the theme docs
 * changes, so newer unpublished Customizer edits (colours, sections, ...) are never overwritten,
 * published or reset from this page.
 */
export async function savePopupDraftAction(popup: PopupThemeConfig) {
  await requireAdmin();
  await applyPopupForCurrentStore("save-draft", popup);
  revalidatePath("/admin/appearance/customize");
  return { ok: true, message: "Popup draft saved." };
}

export async function publishPopupAction(popup: PopupThemeConfig) {
  await requireAdmin();
  await applyPopupForCurrentStore("publish", popup);
  revalidatePath("/", "layout");
  return { ok: true, message: "Popup published to storefront." };
}

/** Draft popup back to the live popup; returns the live popup (null = none published). */
export async function resetPopupDraftAction() {
  await requireAdmin();
  const { popup } = await applyPopupForCurrentStore("reset-draft");
  revalidatePath("/admin/appearance/customize");
  return { ok: true, message: "Popup draft reset to the published popup.", popup: popup ? JSON.parse(JSON.stringify(popup)) as PopupThemeConfig : null };
}
