"use client";

import { usePathname } from "next/navigation";
import { useTenantId } from "@/lib/tenant/TenantContext";
import { useIsThemePreviewMode } from "@/lib/tenant/ThemePreviewModeContext";

/** Sibling of the (protected) admin layout - see admin/theme-customizer-preview/page.tsx. */
const THEME_PREVIEW_ROUTE_PREFIX = "/admin/theme-customizer-preview";

/**
 * Shared suppression check for storefront-only chrome (announcement bar,
 * WhatsApp button, top bar, site header, footer, theme popup). No tenant
 * ever resolves on the platform domain (see middleware.ts), so `!tenantId`
 * alone correctly suppresses chrome on every marketing page - rewritten to a
 * bare URL or not. /superadmin is checked defensively since it's reachable
 * on any host, including a tenant's own domain (where a tenant *would*
 * resolve). `includeAdmin` is opt-in per component to preserve each
 * component's own pre-existing /admin behavior rather than changing it.
 *
 * The theme customizer's live-preview route renders its OWN copies of these
 * same chrome components (fed by the draft theme, instead of the active
 * one) - so on that one route, the *ambient* chrome from the root layout
 * must suppress itself while the preview's own, intentionally-rendered
 * chrome (wrapped in ThemePreviewModeProvider) stays visible. This is an
 * unconditional check (matching the existing /superadmin precedent) since
 * ambient chrome never opts in to preview mode.
 */
export function useChromeSuppressed(opts?: { includeAdmin?: boolean }): boolean {
  const pathname = usePathname();
  const tenantId = useTenantId();
  const isPreviewMode = useIsThemePreviewMode();

  if (pathname?.startsWith(THEME_PREVIEW_ROUTE_PREFIX) && !isPreviewMode) return true;
  if (!tenantId) return true;
  if (pathname?.startsWith("/superadmin")) return true;
  if (opts?.includeAdmin && pathname?.startsWith("/admin")) return true;
  return false;
}
