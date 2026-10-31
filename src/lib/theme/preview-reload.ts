import type { SystemThemeConfig } from "./theme-types";

/**
 * Settings the preview can apply instantly (CSS variables / <html> switches via postMessage).
 * Anything else changes server-rendered components, so the preview must reload with the
 * saved draft to show it.
 */
const LIVE_CSS_KEYS = new Set(["colors", "darkColors", "typography", "layout", "buttons", "cards", "darkMode"]);
const LIVE_CSS_PRODUCT_CARD_KEYS = new Set(["imageRadius", "cardRadius"]);

export function patchNeedsPreviewReload(patch: Partial<SystemThemeConfig>): boolean {
  return Object.keys(patch).some((key) => {
    if (LIVE_CSS_KEYS.has(key)) return false;
    if (key === "productCard") {
      const pc = (patch as Record<string, unknown>).productCard as Record<string, unknown> | undefined;
      return Object.keys(pc ?? {}).some((k) => !LIVE_CSS_PRODUCT_CARD_KEYS.has(k));
    }
    return true;
  });
}
