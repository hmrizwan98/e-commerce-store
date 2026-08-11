import "server-only";
import { tenantCollection, tenantDoc } from "@/lib/firebase/tenant-scope";
import { requestMemo } from "@/lib/request-cache";
import { getBrandingSettings } from "@/lib/firebase/repositories/site-settings";
import { THEME_PRESETS, DEFAULT_SYSTEM_THEME } from "./theme-presets";
import type { SystemThemeConfig, ThemePresetId } from "./theme-types";

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
  };
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

    let mergedConfig = rawConfig ? deepMergeTheme(basePreset, rawConfig) : { ...basePreset };

    // Backward compatibility: map legacy siteSettings/branding into theme tokens if present
    const branding = await getBrandingSettings().catch(() => null);
    if (branding) {
      if (branding.primaryColor && (!rawConfig?.colors?.primary)) {
        mergedConfig.colors.primary = branding.primaryColor;
      }
      if (branding.secondaryColor && (!rawConfig?.colors?.secondary)) {
        mergedConfig.colors.secondary = branding.secondaryColor;
      }
      if (branding.fontFamily && (!rawConfig?.typography?.headingFont)) {
        mergedConfig.typography.headingFont = branding.fontFamily as any;
        mergedConfig.typography.bodyFont = branding.fontFamily as any;
      }
    }

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
      return deepMergeTheme(basePreset, rawDraft);
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
      ...config,
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
      ...config,
      isPublished: false,
      updatedAt: now,
    },
    { merge: true }
  );
}
