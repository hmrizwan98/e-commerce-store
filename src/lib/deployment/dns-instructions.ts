export interface DnsInstructionRecord {
  type: "CNAME" | "A";
  name: string;
  value: string;
  note?: string;
}

/** DNS guidance for a store's own custom domain - pure/deterministic, no real
 * DNS lookup performed. Reuses the platform base URL already resolved by
 * getPlatformBaseUrl() rather than re-deriving it. */
export function getCustomDomainDnsInstructions(hostname: string, platformBaseUrl: string): DnsInstructionRecord[] {
  const base = new URL(platformBaseUrl);
  return [
    {
      type: "CNAME",
      name: hostname,
      value: base.hostname,
      note: `Point ${hostname} at the platform with a CNAME record.`,
    },
  ];
}

/** Documents the existing wildcard-subdomain mechanism every store's default
 * {slug}.{rootDomain} URL already relies on (see buildTenantUrl()) - this is
 * guidance text only, not a new routing mechanism. */
export function getWildcardDnsInstructions(platformBaseUrl: string): DnsInstructionRecord[] {
  const base = new URL(platformBaseUrl);
  return [
    {
      type: "CNAME",
      name: `*.${base.hostname}`,
      value: base.hostname,
      note: "Wildcard subdomain routing for every store's default {slug}.{root domain} URL.",
    },
  ];
}
