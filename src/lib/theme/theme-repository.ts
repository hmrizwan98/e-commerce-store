import "server-only";
import { tenantCollection, tenantDoc } from "@/lib/firebase/tenant-scope";
import { requestMemo } from "@/lib/request-cache";
import { getBrandingSettings } from "@/lib/firebase/repositories/site-settings";
import { THEME_PRESETS, DEFAULT_SYSTEM_THEME } from "./theme-presets";
import { isLoadableFontKey } from "./font-keys";
import { stripEmptyObjects, SECTION_STAGING_KEYS } from "./theme-safety";
import { FieldValue } from "firebase-admin/firestore";
import type { ThemeLogos } from "@/types/theme";
import type { SystemThemeConfig, ThemePresetId, PopupThemeConfig } from "./theme-types";
import { applyPopupOperation, type PopupOperation } from "./theme-popup";
import { adminDb } from "@/lib/firebase/admin";
import { requireCurrentTenant } from "@/lib/tenant/current";

const THEME_SETTINGS_COLLECTION = "themeSettings";
const THEMES_COLLECTION = "themes";

function deepMergeTheme(preset: SystemThemeConfig, override: Partial<SystemThemeConfig>): SystemThemeConfig {
  return {
    ...preset,
    ...override,
    colors: { ...preset.colors, ...(override.colors ?? {}) },
    darkColors: { ...(preset.darkColors ?? {}), ...(override.darkColors ?? {}) },
    typography: { ...preset.typography, ...(override.typography ?? {}) },
    logos: { ...(preset.logos ?? {}), ...(override.logos ?? {}) },
    buttons: { ...preset.buttons, ...(override.buttons ?? {}) },
    cards: { ...preset.cards, ...(override.cards ?? {}) },
    productCard: { ...preset.productCard, ...(override.productCard ?? {}) },
    productDetail: { ...(preset.productDetail ?? {}), ...(override.productDetail ?? {}) },
    cart: { ...(preset.cart ?? {}), ...(override.cart ?? {}) },
    header: { ...preset.header, ...(override.header ?? {}) },
    footer: { ...preset.footer, ...(override.footer ?? {}) },
    banner: { ...preset.banner, ...(override.banner ?? {}) },
    layout: { ...preset.layout, ...(override.layout ?? {}) },
    darkMode: { ...preset.darkMode, ...(override.darkMode ?? {}) },
    popup: { ...(preset.popup ?? {}), ...(override.popup ?? {}) },
    hero: { ...(preset.hero ?? {}), ...(override.hero ?? {}) },
    categories: { ...(preset.categories ?? {}), ...(override.categories ?? {}) },
    promo: { ...(preset.promo ?? {}), ...(override.promo ?? {}) },
    announcementBar: { ...(preset.announcementBar ?? {}), ...(override.announcementBar ?? {}) },
    homepageSections: override.homepageSections !== undefined ? override.homepageSections : preset.homepageSections,
  };
}

/**
 * Backward compatibility: Settings -> Branding colours/font fill in only what the theme itself
 * doesn't set. Shared by the live and the draft resolver so the preview matches the storefront.
 */
async function applyLegacyBranding(config: SystemThemeConfig, raw: Partial<SystemThemeConfig> | null): Promise<void> {
  const branding = await getBrandingSettings().catch(() => null);
  if (!branding) return;
  if (branding.primaryColor && !raw?.colors?.primary) config.colors.primary = branding.primaryColor;
  if (branding.secondaryColor && !raw?.colors?.secondary) config.colors.secondary = branding.secondaryColor;
  // Only a font the storefront can actually load (the Branding field is free text).
  if (!raw?.typography?.headingFont && isLoadableFontKey(branding.fontFamily)) {
    config.typography.headingFont = branding.fontFamily;
    config.typography.bodyFont = branding.fontFamily;
  }
}

/**
 * Resolves the current tenant's active SystemThemeConfig.
 * Fully memoized per-request via requestMemo to prevent duplicate Firestore queries.
 */
export async function getActiveThemeConfig(): Promise<SystemThemeConfig> {
  return requestMemo("active-theme-config", () => resolveActiveThemeConfig());
}

async function resolveActiveThemeConfig(): Promise<SystemThemeConfig> {
  try {
    const activeDocRef = await tenantDoc(THEME_SETTINGS_COLLECTION, "active");
    const activeSnap = await activeDocRef.get();

    let rawConfig: Partial<SystemThemeConfig> | null = null;

    if (activeSnap.exists) {
      rawConfig = activeSnap.data() as Partial<SystemThemeConfig>;
    } else {
      // Check legacy active theme document from themes collection
      const themesColl = await tenantCollection(THEMES_COLLECTION);
      const activeQuery = await themesColl.where("isActive", "==", true).limit(1).get();
      if (!activeQuery.empty) {
        rawConfig = activeQuery.docs[0].data() as Partial<SystemThemeConfig>;
      }
    }

    const presetKey: ThemePresetId = (rawConfig?.presetId as ThemePresetId) || "modern-minimal";
    const basePreset = THEME_PRESETS[presetKey] ?? DEFAULT_SYSTEM_THEME;

    // Always a fresh deep copy - never mutate the shared preset objects (they're module-level
    // and shared by every tenant served by this server instance).
    const mergedConfig = deepMergeTheme(basePreset, rawConfig ?? {});
    await applyLegacyBranding(mergedConfig, rawConfig);
    return mergedConfig;
  } catch (error) {
    console.error("Error resolving active theme config, using fallback:", error);
    return DEFAULT_SYSTEM_THEME;
  }
}

/**
 * Resolves the draft SystemThemeConfig for admin live preview mode.
 */
export async function getDraftThemeConfig(): Promise<SystemThemeConfig> {
  return requestMemo("draft-theme-config", () => resolveDraftThemeConfig());
}

async function resolveDraftThemeConfig(): Promise<SystemThemeConfig> {
  try {
    const draftDocRef = await tenantDoc(THEME_SETTINGS_COLLECTION, "draft");
    const draftSnap = await draftDocRef.get();

    if (draftSnap.exists) {
      const rawDraft = draftSnap.data() as Partial<SystemThemeConfig>;
      const presetKey: ThemePresetId = (rawDraft.presetId as ThemePresetId) || "modern-minimal";
      const basePreset = THEME_PRESETS[presetKey] ?? DEFAULT_SYSTEM_THEME;
      const merged = deepMergeTheme(basePreset, rawDraft);
      // Same legacy-branding fallback as the live theme, so the editor preview matches it.
      await applyLegacyBranding(merged, rawDraft);
      return merged;
    }
  } catch (error) {
    console.error("Error reading draft theme config:", error);
  }

  return getActiveThemeConfig();
}

/**
 * Atomically publishes a theme config to stores/{tenantId}/themeSettings/active.
 */
export async function setActiveThemeConfig(config: Partial<SystemThemeConfig>): Promise<void> {
  const activeRef = await tenantDoc(THEME_SETTINGS_COLLECTION, "active");
  const now = Date.now();
  await activeRef.set(
    {
      // Empty maps are dropped: with merge an empty map would wipe the stored one (e.g. logos).
      ...stripEmptyObjects(config),
      isPublished: true,
      updatedAt: now,
    },
    { merge: true }
  );
}

/**
 * Saves working changes to stores/{tenantId}/themeSettings/draft without publishing.
 */
export async function saveDraftThemeConfig(config: Partial<SystemThemeConfig>): Promise<void> {
  const draftRef = await tenantDoc(THEME_SETTINGS_COLLECTION, "draft");
  const now = Date.now();
  await draftRef.set(
    {
      ...stripEmptyObjects(config),
      isPublished: false,
      updatedAt: now,
    },
    { merge: true }
  );
}

/**
 * Editor preview staging: unsaved customizer changes that need a server render (homepage
 * sections, card/collection/product/cart settings) are written to themeSettings/preview -
 * never to the draft, so "Save Draft" keeps its meaning and nothing the admin hasn't saved
 * overwrites their draft. The preview uses it only while it is newer than the draft.
 */
export async function savePreviewThemeConfig(config: Partial<SystemThemeConfig>): Promise<void> {
  const ref = await tenantDoc(THEME_SETTINGS_COLLECTION, "preview");
  await ref.set({ ...config, isPublished: false, updatedAt: Date.now() });
}

export async function getPreviewThemeConfig(): Promise<SystemThemeConfig> {
  try {
    const [previewSnap, draftSnap] = await Promise.all([
      (await tenantDoc(THEME_SETTINGS_COLLECTION, "preview")).get(),
      (await tenantDoc(THEME_SETTINGS_COLLECTION, "draft")).get(),
    ]);
    const preview = previewSnap.exists ? (previewSnap.data() as Partial<SystemThemeConfig> & { updatedAt?: number }) : null;
    const draftUpdatedAt = (draftSnap.exists ? (draftSnap.get("updatedAt") as number | undefined) : undefined) ?? 0;
    if (preview && (preview.updatedAt ?? 0) > draftUpdatedAt) {
      const presetKey: ThemePresetId = (preview.presetId as ThemePresetId) || "modern-minimal";
      const merged = deepMergeTheme(THEME_PRESETS[presetKey] ?? DEFAULT_SYSTEM_THEME, preview);
      await applyLegacyBranding(merged, preview);
      return merged;
    }
  } catch (error) {
    console.error("Error reading preview theme config:", error);
  }
  return getDraftThemeConfig();
}

/**
 * Removes the Customizer's homepage-section staging copy from the given theme docs, so the
 * next Customizer session starts from the LIVE sections (the homepageSections collection) and
 * no stale copy can be published or "discarded" back into the draft.
 */
export async function clearSectionStaging(docIds: ("draft" | "active")[]): Promise<void> {
  const del = Object.fromEntries(SECTION_STAGING_KEYS.map((k) => [k, FieldValue.delete()]));
  for (const id of docIds) {
    const ref = await tenantDoc(THEME_SETTINGS_COLLECTION, id);
    if ((await ref.get()).exists) await ref.update({ ...del, ...(id === "draft" ? { updatedAt: Date.now() } : {}) });
  }
}

/**
 * Store logos (header, dark, footer, favicon, Apple touch icon, loading logo) written to the
 * canonical theme docs - the draft and, when the store already has a published theme, the live
 * one. Field-level merge: only the given keys change; every other theme value is untouched.
 */
export async function saveThemeLogos(logos: Partial<ThemeLogos>): Promise<void> {
  const clean = Object.fromEntries(Object.entries(logos).filter(([, v]) => typeof v === "string")) as Partial<ThemeLogos>;
  if (!Object.keys(clean).length) return;
  const now = Date.now();
  const draftRef = await tenantDoc(THEME_SETTINGS_COLLECTION, "draft");
  const activeRef = await tenantDoc(THEME_SETTINGS_COLLECTION, "active");
  const [draftSnap, activeSnap] = await Promise.all([draftRef.get(), activeRef.get()]);
  // A store without a theme doc yet: write the draft only (a partial live doc would make the
  // storefront fall back to a different preset).
  if (draftSnap.exists || !activeSnap.exists) await draftRef.set({ logos: clean, updatedAt: now }, { merge: true });
  if (activeSnap.exists) await activeRef.set({ logos: clean, updatedAt: now }, { merge: true });
}

/** Popups & Modals page: popup-only draft save / publish / reset (see theme-popup.ts). */
export async function applyPopupForCurrentStore(op: PopupOperation, popup?: PopupThemeConfig) {
  const tenant = await requireCurrentTenant();
  return applyPopupOperation(adminDb(), tenant.id, op, popup);
}
