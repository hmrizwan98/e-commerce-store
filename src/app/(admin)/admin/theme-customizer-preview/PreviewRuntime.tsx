"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { compileThemeToCssText } from "@/lib/theme/theme-compiler";
import { ALL_FONT_VARIABLES, FONT_PRESETS } from "@/lib/theme/fonts";
import { resolvePreviewLink } from "@/lib/theme/preview-links";
import AnnouncementBar from "@/components/AnnouncementBar";
import ThemeAnnouncementBarAdapter from "@/components/theme/ThemeAnnouncementBarAdapter";
import ThemePopupModal from "@/components/theme/ThemePopupModal";
import SiteHeader from "@/app/SiteHeader";
import Footer from "@/shared/Footer/Footer";
import { isThemeTopBarActive } from "@/lib/theme/announcement";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";
import type { GeneralSettings } from "@/types/site-settings";

export interface PreviewRuntimeProps {
  initialTheme: SystemThemeConfig;
  storeName: string;
  socialLinks?: GeneralSettings["socialLinks"];
  tenantId: string;
  /** Public storefront origin (e.g. https://glamix.webriiz.com) for pages the preview can't render. */
  storefrontOrigin: string;
  children: React.ReactNode;
}

/**
 * Everything live in the Theme Customizer preview iframe:
 * - holds the theme being edited (sent by CustomizeShell via postMessage) and renders the CSS
 *   variables + the storefront chrome (announcement bars, header, footer, popup) from it, so
 *   chrome settings (e.g. header height, announcement text) change instantly - no save, no reload;
 * - on "theme-preview-refresh" does a soft router.refresh() (server-rendered page content picks
 *   up the staged preview config; no remount, scroll position kept);
 * - intercepts link clicks: the iframe lives on the admin host, so storefront links are mapped to
 *   preview pages or opened on the public storefront - never followed into an admin page.
 */
export default function PreviewRuntime({ initialTheme, storeName, socialLinks, tenantId, storefrontOrigin, children }: PreviewRuntimeProps) {
  const router = useRouter();
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "theme-preview-update" && event.data.theme) setTheme(event.data.theme);
      if (event.data?.type === "theme-preview-refresh") router.refresh();
    }
    window.addEventListener("message", handleMessage);
    window.parent.postMessage({ type: "theme-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  // Fonts picked in the editor need their next/font classes (the root layout only adds the
  // published theme's), and the same <html> switches the storefront layout sets.
  useEffect(() => {
    document.documentElement.classList.add(...ALL_FONT_VARIABLES.split(" ").filter(Boolean));
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.cardStyle = theme.cards?.applyToProductCards ? "theme" : "design";
    root.dataset.darkMode = theme.darkMode?.enabled === true ? "on" : "off";
  }, [theme.cards?.applyToProductCards, theme.darkMode?.enabled]);

  // Links: capture phase, before Next's <Link> handler runs.
  useEffect(() => {
    const navigateParent = (surface: string, productSlug?: string) =>
      window.parent.postMessage({ type: "theme-preview-navigate", surface, productSlug }, window.location.origin);

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const action = resolvePreviewLink(anchor.getAttribute("href"), window.location.origin, storefrontOrigin);
      if (action.kind === "default") return;
      e.preventDefault();
      e.stopPropagation();
      if (action.kind === "surface") navigateParent(action.surface, action.productSlug);
      else if (action.kind === "storefront" || action.kind === "external") window.open(action.url, "_blank", "noopener,noreferrer");
      // "blocked": an admin/API path - do nothing.
    }
    function onSubmit(e: SubmitEvent) {
      // Storefront forms (e.g. search) target storefront routes that don't exist on the admin host.
      const form = e.target as HTMLFormElement;
      const action = resolvePreviewLink(form.getAttribute("action") || "/search", window.location.origin, storefrontOrigin);
      e.preventDefault();
      if (action.kind === "surface") navigateParent(action.surface, action.productSlug);
      else if (action.kind === "storefront") {
        const query = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
        window.open(`${action.url}${query ? `?${query}` : ""}`, "_blank", "noopener,noreferrer");
      }
    }
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, [storefrontOrigin]);

  const cssText = compileThemeToCssText(theme);
  const bodyFont = FONT_PRESETS[theme.typography?.bodyFont ?? "poppins"] ?? FONT_PRESETS.poppins;
  const headingFont = FONT_PRESETS[theme.typography?.headingFont ?? "poppins"] ?? FONT_PRESETS.poppins;

  return (
    <>
      <style
        id="theme-vars-preview"
        dangerouslySetInnerHTML={{
          __html: `${cssText}\n:root { --font-body: var(${bodyFont.cssVar}); --font-heading: var(${headingFont.cssVar}); }`,
        }}
      />
      {/* Same chrome (and the same "one announcement bar" rule) as ClientProviders.tsx. */}
      <AnnouncementBar hidden={isThemeTopBarActive(theme.header?.topBar)} />
      <ThemeAnnouncementBarAdapter announcementSettings={theme.announcementBar} topBar={theme.header?.topBar} />
      <SiteHeader headerSettings={theme.header} cartSettings={theme.cart} logos={theme.logos} storeName={storeName} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer footerSettings={theme.footer} logos={theme.logos} storeName={storeName} socialLinks={socialLinks} />
      <ThemePopupModal popupConfig={theme.popup} tenantId={tenantId} themePresetId={theme.presetId} />
    </>
  );
}
