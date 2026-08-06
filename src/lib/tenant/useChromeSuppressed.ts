"use client";

import { usePathname } from "next/navigation";
import { useTenantId } from "@/lib/tenant/TenantContext";

/**
 * Shared suppression check for storefront-only chrome (announcement bar,
 * WhatsApp button, top bar, site header, footer). No tenant ever resolves
 * on the platform domain (see middleware.ts), so `!tenantId` alone
 * correctly suppresses chrome on every marketing page - rewritten to a bare
 * URL or not. /superadmin is checked defensively since it's reachable on
 * any host, including a tenant's own domain (where a tenant *would*
 * resolve). `includeAdmin` is opt-in per component to preserve each
 * component's own pre-existing /admin behavior rather than changing it.
 */
export function useChromeSuppressed(opts?: { includeAdmin?: boolean }): boolean {
  const pathname = usePathname();
  const tenantId = useTenantId();

  if (!tenantId) return true;
  if (pathname?.startsWith("/superadmin")) return true;
  if (opts?.includeAdmin && pathname?.startsWith("/admin")) return true;
  return false;
}
