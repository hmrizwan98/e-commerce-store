import type { SystemThemeConfig } from "./theme-types";

/**
 * Settings the preview applies instantly, client-side (PreviewRuntime): CSS variables,
 * <html> switches and the storefront chrome (announcement bars, header, footer, logos, popup).
 * Anything else is rendered on the server (homepage sections, card / collection / product /
 * cart settings), so the preview needs the change staged + a soft refresh to show it.
 */
const LIVE_KEYS = new Set([
  "colors",
  "darkColors",
  "typography",
  "layout",
  "buttons",
  "cards",
  "darkMode",
  "header",
  "footer",
  "logos",
  "announcementBar",
  "popup",
]);
const LIVE_PRODUCT_CARD_KEYS = new Set(["imageRadius", "cardRadius"]);

export function patchNeedsPreviewReload(patch: Partial<SystemThemeConfig>): boolean {
  return Object.keys(patch).some((key) => {
    if (LIVE_KEYS.has(key)) return false;
    if (key === "productCard") {
      const pc = (patch as Record<string, unknown>).productCard as Record<string, unknown> | undefined;
      return Object.keys(pc ?? {}).some((k) => !LIVE_PRODUCT_CARD_KEYS.has(k));
    }
    return true;
  });
}

/** True if applying `patch` actually changed any of the keys it touches. A component that
 * re-sends identical values (e.g. on every render) is then a no-op instead of a state update. */
export function draftPatchChanges(prev: SystemThemeConfig, next: SystemThemeConfig, patch: Partial<SystemThemeConfig>): boolean {
  return Object.keys(patch).some(
    (key) =>
      JSON.stringify((prev as unknown as Record<string, unknown>)[key]) !==
      JSON.stringify((next as unknown as Record<string, unknown>)[key])
  );
}
