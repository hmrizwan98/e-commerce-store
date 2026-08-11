"use client";

import React, { useEffect, useState } from "react";
import { compileThemeToCssText } from "@/lib/theme/theme-compiler";
import { FONT_PRESETS } from "@/lib/theme/fonts";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";

export interface ThemePreviewStyleSyncProps {
  initialTheme: SystemThemeConfig;
}

/**
 * Renders the draft theme's CSS variables and listens for live edits posted
 * by the customizer parent window (CustomizeShell.tsx), so the preview
 * reflects unsaved changes without any extra Firestore write. Every message
 * is re-run through compileThemeToCssText() - the same sanitizer the real
 * storefront uses - before it can ever reach the DOM, so a same-origin
 * postMessage can never inject unsanitized CSS/HTML, and the message is
 * ignored outright if it isn't same-origin.
 */
export default function ThemePreviewStyleSync({ initialTheme }: ThemePreviewStyleSyncProps) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "theme-preview-update") return;
      setTheme(event.data.theme);
    }
    window.addEventListener("message", handleMessage);
    window.parent.postMessage({ type: "theme-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const cssText = compileThemeToCssText(theme);
  const bodyFont = FONT_PRESETS[theme.typography?.bodyFont ?? "poppins"];
  const headingFont = FONT_PRESETS[theme.typography?.headingFont ?? "poppins"];

  return (
    <style
      id="theme-vars-preview"
      dangerouslySetInnerHTML={{
        __html: `${cssText}\n:root { --font-body: var(${bodyFont.variable}); --font-heading: var(${headingFont.variable}); }`,
      }}
    />
  );
}
