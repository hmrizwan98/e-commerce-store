import type { DomainSetting } from "@/types/domain-settings";

/**
 * Reconciles the domainSettings map against the current domains[] list: adds a default
 * entry (pending DNS/SSL, not primary) for any newly-added hostname, drops entries for
 * hostnames no longer present, and leaves everything else (including any status a real
 * check might later set) untouched. The very first custom domain a store ever gets
 * defaults to primary; every domain after that defaults to non-primary.
 */
export function syncDomainSettings(
  existing: Record<string, DomainSetting> | undefined,
  domains: string[]
): Record<string, DomainSetting> {
  const current = existing ?? {};
  const hadAnyPrimary = Object.values(current).some((d) => d.isPrimary);

  const next: Record<string, DomainSetting> = {};
  domains.forEach((hostname, index) => {
    next[hostname] =
      current[hostname] ??
      ({
        hostname,
        dnsStatus: "pending",
        sslStatus: "pending",
        isPrimary: !hadAnyPrimary && index === 0,
      } satisfies DomainSetting);
  });
  return next;
}
