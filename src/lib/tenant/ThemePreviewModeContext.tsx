"use client";

import React, { createContext, useContext } from "react";

/**
 * Lets the storefront chrome intentionally rendered *inside* the theme
 * customizer's live-preview route (see appearance/customize/preview/page.tsx)
 * opt out of that route's own chrome suppression (useChromeSuppressed.ts),
 * without weakening the suppression for the *ambient* header/footer/popup
 * that the root layout's ClientProviders would otherwise also render around
 * that same route. Only components explicitly wrapped in
 * ThemePreviewModeProvider see `true` here.
 */
const ThemePreviewModeContext = createContext(false);

export function ThemePreviewModeProvider({ children }: { children: React.ReactNode }) {
  return <ThemePreviewModeContext.Provider value={true}>{children}</ThemePreviewModeContext.Provider>;
}

export function useIsThemePreviewMode(): boolean {
  return useContext(ThemePreviewModeContext);
}
