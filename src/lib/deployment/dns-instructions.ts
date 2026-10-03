import { DEFAULT_CNAME_TARGET, buildDnsRecords } from "@/lib/domains/custom-domain";

export interface DnsInstructionRecord {
  type: "CNAME" | "A";
  name: string;
  value: string;
  note?: string;
}

/** DNS records for a store's own custom domain on Vercel - the storefront (A record at the
 * apex, CNAME for a subdomain), www and admin.<domain> (CNAME). Same records the Store Admin
 * self-service flow shows, minus its ownership TXT (Super Admin is trusted to add domains).
 * `platformBaseUrl` is kept for call-site compatibility. */
export function getCustomDomainDnsInstructions(hostname: string, _platformBaseUrl?: string): DnsInstructionRecord[] {
  return buildDnsRecords({ hostname, ownershipToken: "" })
    .filter((r) => r.purpose !== "ownership" && r.type !== "TXT")
    .map((r) => ({
      type: r.type as "A" | "CNAME",
      name: r.fqdn,
      value: r.value,
      note: r.purpose === "storefront" ? "Storefront" : r.purpose === "admin" ? "Store Admin" : r.purpose === "www" ? "www (redirects to the domain)" : undefined,
    }));
}

/** Records shown when no live provider value is known yet. */
export const CUSTOM_DOMAIN_CNAME_TARGET = DEFAULT_CNAME_TARGET;

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
