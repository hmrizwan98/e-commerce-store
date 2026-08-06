import type { Metadata } from "next";
import "./globals.css";
import "@/fonts/line-awesome-1.3.0/css/line-awesome.css";
import "@/styles/index.scss";
import "rc-slider/assets/index.css";
import ClientProviders from "./ClientProviders";
import { getActiveTheme, DEFAULT_THEME } from "@/lib/firebase/repositories/themes";
import { getGeneralSettings, DEFAULT_GENERAL_SETTINGS } from "@/lib/firebase/repositories/site-settings";
import { themeToCssText } from "@/lib/theme/css-variables";
import { FONT_PRESETS, ALL_FONT_VARIABLES } from "@/lib/theme/fonts";
import { getCurrentTenant } from "@/lib/tenant/current";
import { isPlatformDomainRequest } from "@/lib/tenant/platform-domain";
import { requestMemo } from "@/lib/request-cache";
import { PLATFORM_SITE_URL } from "@/lib/marketing/site-url";
import type { Theme } from "@/types/theme";
import type { GeneralSettings } from "@/types/site-settings";

/**
 * Reserved subdomains (e.g. Super Admin) have no tenant to load a theme for -
 * keep the SAME component tree shape either way (just swap which data feeds
 * it) rather than branching into two structurally different <html> trees.
 * Conditionally omitting ClientProviders/theme injection based on a runtime
 * value broke React's reconciliation across a Server Action's RSC re-render
 * (redux's <Provider> crashed with "Cannot read properties of null (reading
 * 'useMemo')") - always rendering the same shape avoids that entirely.
 *
 * A suspended store still resolves to a tenantId (getCurrentTenant() allows
 * that - see current.ts), but getActiveTheme()/getGeneralSettings() go
 * through requireCurrentTenant(), which now throws for a non-active tenant -
 * so a suspended store must short-circuit to the defaults here too, same as
 * "no tenant", plus a `suspended` flag so the page body can be swapped out.
 *
 * Memoized per-request (requestMemo) since generateMetadata() and RootLayout
 * both call this - without it, this ran twice (and each un-memoized
 * getCurrentTenant()/getActiveTheme()/getGeneralSettings() call inside it ran
 * twice again) on every single page in the app.
 */
async function resolveThemeAndSettings(): Promise<{
  tenantId: string | null;
  theme: Theme;
  general: GeneralSettings;
  suspended: boolean;
}> {
  return requestMemo("theme-and-settings", () => computeThemeAndSettings());
}

async function computeThemeAndSettings(): Promise<{
  tenantId: string | null;
  theme: Theme;
  general: GeneralSettings;
  suspended: boolean;
}> {
  // Checked BEFORE calling getCurrentTenant() - that function has a
  // local-dev-only "no slug matched -> fall back to the first available
  // store" convenience (see tenant/current.ts) that would otherwise let a
  // request to the Platform's own domain resolve a real tenant, feeding a
  // real theme/tenantId into ClientProviders and defeating every
  // downstream chrome-suppression check. isPlatformDomainRequest() makes
  // "platform domain -> no tenant" a guarantee, not a hope.
  if (isPlatformDomainRequest()) {
    return { tenantId: null, theme: DEFAULT_THEME, general: DEFAULT_GENERAL_SETTINGS, suspended: false };
  }
  const tenant = await getCurrentTenant();
  if (!tenant) {
    return { tenantId: null, theme: DEFAULT_THEME, general: DEFAULT_GENERAL_SETTINGS, suspended: false };
  }
  if (tenant.status !== "active") {
    return { tenantId: tenant.id, theme: DEFAULT_THEME, general: DEFAULT_GENERAL_SETTINGS, suspended: true };
  }
  const [theme, general] = await Promise.all([getActiveTheme(), getGeneralSettings()]);
  return { tenantId: tenant.id, theme, general, suspended: false };
}

export async function generateMetadata(): Promise<Metadata> {
  const { tenantId, theme, general, suspended } = await resolveThemeAndSettings();
  if (!tenantId) return { metadataBase: new URL(PLATFORM_SITE_URL), title: "Admin" };
  if (suspended) return { title: "Store unavailable" };

  return {
    title: general.seoTitle || general.storeName,
    description: general.seoDescription,
    icons: theme.logos.favicon
      ? {
          icon: theme.logos.favicon,
          apple: theme.logos.appleTouchIcon || theme.logos.favicon,
        }
      : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const { tenantId, theme, general, suspended } = await resolveThemeAndSettings();
  const cssText = themeToCssText(theme);
  const bodyFont = FONT_PRESETS[theme.typography.bodyFont ?? "poppins"];
  const headingFont = FONT_PRESETS[theme.typography.headingFont ?? "poppins"];

  return (
    <html
      lang="en"
      dir=""
      className={`${bodyFont.className} ${ALL_FONT_VARIABLES}`}
    >
      <head>
        <style
          id="theme-vars"
          dangerouslySetInnerHTML={{
            __html: `${cssText}\n:root { --font-body: var(${bodyFont.variable}); --font-heading: var(${headingFont.variable}); }`,
          }}
        />
      </head>
      <body className="bg-[var(--background,white)] text-base dark:bg-neutral-900 text-[var(--text,#111827)] dark:text-neutral-200">
        <ClientProviders
          headerSettings={theme.header}
          footerSettings={theme.footer}
          storeName={general.storeName}
          tenantId={tenantId ?? ""}
        >
          {suspended ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-6 text-center">
              <h1 className="text-2xl font-semibold">This store is currently unavailable</h1>
              <p className="text-neutral-500">Please check back later.</p>
            </div>
          ) : (
            children
          )}
        </ClientProviders>
      </body>
    </html>
  );
}
