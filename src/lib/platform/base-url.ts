import "server-only";

function normalizeDomain(value: string | undefined | null): string | null {
  const trimmed = value?.trim().toLowerCase();
  return trimmed ? trimmed.replace(/^https?:\/\//, "").replace(/\/$/, "") : null;
}

/**
 * Resolves the platform's own base URL - the ONE place any store/tenant URL
 * is derived from (see tenant-url.ts). Resolution order:
 *   1. NEXT_PUBLIC_ROOT_DOMAIN, if configured (a real custom domain).
 *   2. Vercel's own auto-provided deployment URL (VERCEL_PROJECT_PRODUCTION_URL,
 *      falling back to VERCEL_URL) - so a fresh deployment is correct with
 *      zero manual configuration, no placeholder domain ever needed.
 *   3. Local dev fallback - http://localhost:{PORT ?? 3000}.
 * Never falls back to a placeholder/fake domain.
 */
export function getPlatformBaseUrl(): string {
  const rootDomain = normalizeDomain(process.env.NEXT_PUBLIC_ROOT_DOMAIN);
  if (rootDomain) return `https://${rootDomain}`;

  const vercelDomain =
    normalizeDomain(process.env.VERCEL_PROJECT_PRODUCTION_URL) || normalizeDomain(process.env.VERCEL_URL);
  if (vercelDomain) return `https://${vercelDomain}`;

  const port = process.env.PORT?.trim() || "3000";
  return `http://localhost:${port}`;
}
