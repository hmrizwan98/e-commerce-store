"use server";

import { requireAdmin } from "@/lib/firebase/require-admin";
import {
  savePreviewThemeConfig,
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

/** Stages unsaved editor changes for the preview only (themeSettings/preview). Does NOT touch
 * the draft or the live store - see theme-repository.ts. */
export async function stagePreviewThemeAction(config: Partial<SystemThemeConfig>) {
  await requireAdmin();
  await savePreviewThemeConfig(config);
  return { ok: true as const };
}

import { adminDb } from "@/lib/firebase/admin";
import { requireCurrentTenant } from "@/lib/tenant/current";
import { clearSectionStaging } from "@/lib/theme/theme-repository";
import { publishHomepageSections } from "@/lib/theme/homepage-publish";
import { withoutSectionStaging } from "@/lib/theme/theme-safety";
import type { SectionConflict } from "@/lib/theme/homepage-sections-sync";
import { getAllHomepageSectionsForAdmin } from "@/lib/firebase/repositories/homepage-sections";
import type { HomepageSection } from "@/types/homepage-section";

export type PublishCustomizerResult =
  | { ok: true; sectionsBaseline: Record<string, number> | null }
  | { ok: false; reason: "sections-conflict"; conflicts: SectionConflict[] };

/**
 * Publishes the saved draft. Homepage sections (if the draft has edited them) are published
 * NON-destructively first (lib/theme/homepage-publish.ts): if the live sections changed since the
 * Customizer copied them, nothing at all is published and the conflicts are returned, unless the
 * merchant explicitly chose `force` ("Publish anyway"). Theme settings are published only after
 * the sections succeed. The section staging copy is then cleared from the draft and is never
 * stored in the live theme doc.
 */
export async function publishCustomizerAction(opts: { force?: boolean } = {}): Promise<PublishCustomizerResult> {
  await requireAdmin();
  const tenant = await requireCurrentTenant();
  const currentDraft = await getDraftThemeConfig();

  let sectionsBaseline: Record<string, number> | null = null;
  if (currentDraft.homepageSections !== undefined) {
    const draftSections = currentDraft.homepageSections.map((sec, idx) => ({ ...sec, id: sec.id || `sec-${Date.now()}-${idx}` }));
    const res = await publishHomepageSections(adminDb(), tenant.id, {
      draft: draftSections,
      baseline: currentDraft.homepageSectionsBaseline ?? null,
      draftUpdatedAt: (currentDraft as { updatedAt?: number }).updatedAt,
      force: Boolean(opts.force),
    });
    if (!res.ok) return { ok: false, reason: "sections-conflict", conflicts: res.conflicts };
    sectionsBaseline = res.baseline;
  }

  await setActiveThemeConfig(withoutSectionStaging(currentDraft as unknown as Record<string, unknown>) as Partial<SystemThemeConfig>);
  await clearSectionStaging(["draft", "active"]);

  revalidatePath("/", "layout");
  revalidatePath("/admin/appearance/customize/preview");
  return { ok: true, sectionsBaseline };
}

/** Overwrites the draft with the currently-published config - the customizer's "Discard" action.
 * The section staging copy is cleared too, so the editor reloads the LIVE sections. */
export async function discardCustomizerDraftAction() {
  await requireAdmin();
  const activeConfig = await getActiveThemeConfig();
  await saveDraftThemeConfig(withoutSectionStaging(activeConfig as unknown as Record<string, unknown>) as Partial<SystemThemeConfig>);
  await clearSectionStaging(["draft"]);
  revalidatePath("/admin/appearance/customize/preview");
  return { ok: true as const, config: withoutSectionStaging(activeConfig as unknown as Record<string, unknown>) as unknown as SystemThemeConfig };
}

/** The LIVE homepage sections right now (for "Load live sections" after a conflict). */
export async function getLiveHomepageSectionsAction(): Promise<HomepageSection[]> {
  await requireAdmin();
  return JSON.parse(JSON.stringify(await getAllHomepageSectionsForAdmin()));
}

import { getAllBannersForAdmin } from "@/lib/firebase/repositories/banners";
import {
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
  setBannerActive,
  type BannerFormInput,
} from "@/lib/firebase/banner-actions";
import type { Banner } from "@/types/banner";

export async function getHeroSlidesForCustomizerAction(): Promise<Banner[]> {
  await requireAdmin();
  const banners = await getAllBannersForAdmin("hero");
  return JSON.parse(JSON.stringify(banners));
}

export async function saveHeroSlideForCustomizerAction(
  id: string | null,
  input: BannerFormInput
): Promise<{ ok: true; id: string }> {
  await requireAdmin();
  let slideId = id;
  if (slideId) {
    await updateBanner(slideId, input);
  } else {
    slideId = await createBanner("hero", input);
  }
  revalidatePath("/admin/appearance/customize/preview");
  return { ok: true, id: slideId };
}

export async function deleteHeroSlideForCustomizerAction(id: string): Promise<{ ok: true }> {
  await requireAdmin();
  await deleteBanner(id);
  revalidatePath("/admin/appearance/customize/preview");
  return { ok: true };
}

export async function reorderHeroSlidesForCustomizerAction(orderedIds: string[]): Promise<{ ok: true }> {
  await requireAdmin();
  await reorderBanners(orderedIds);
  revalidatePath("/admin/appearance/customize/preview");
  return { ok: true };
}

export async function toggleHeroSlideActiveForCustomizerAction(id: string, isActive: boolean): Promise<{ ok: true }> {
  await requireAdmin();
  await setBannerActive(id, isActive);
  revalidatePath("/admin/appearance/customize/preview");
  return { ok: true };
}

