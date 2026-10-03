/**
 * Custom domain rules - pure (no server/client-only imports), shared by the Store Admin
 * domain page, the Super Admin panel, the connection service and tests.
 *
 * A store's own domain (e.g. glamix.pk) serves the storefront at the domain itself and the
 * Store Admin at admin.<domain>; www.<domain> redirects to the domain. Ownership is proven
 * with a TXT record before the domain is attached anywhere.
 */
import type { CustomDomainDnsRecord } from "@/types/domain-settings";

/** Vercel's documented defaults - used when the API's recommendations aren't available. */
export const DEFAULT_APEX_IPV4 = "76.76.21.21";
export const DEFAULT_CNAME_TARGET = "cname.vercel-dns.com";

export const OWNERSHIP_TXT_LABEL = "_webriiz-verify";
export const OWNERSHIP_TXT_PREFIX = "webriiz-verify=";

const HOSTNAME_PATTERN = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

/** Second-level public suffixes common for this platform's markets - so "glamix.com.pk"
 * is treated as an apex domain (A record), not a subdomain of "com.pk". Not exhaustive;
 * a miss only affects which DNS record type is suggested, never routing. */
const MULTI_PART_SUFFIXES = new Set([
  "com.pk", "net.pk", "org.pk", "edu.pk", "gov.pk", "biz.pk", "web.pk", "fam.pk",
  "co.uk", "org.uk", "me.uk", "ltd.uk", "plc.uk",
  "com.au", "net.au", "org.au",
  "co.in", "net.in", "org.in", "firm.in", "gen.in", "ind.in",
  "com.bd", "com.sa", "com.ae", "co.ae", "com.qa", "com.om", "com.kw", "com.bh",
  "co.nz", "co.za", "com.my", "com.sg", "com.tr", "com.eg", "com.ng", "co.ke",
]);

export type DomainValidation = { ok: true; hostname: string } | { ok: false; error: string };

/**
 * Normalizes what a store owner typed ("https://www.Glamix.pk/shop" -> "glamix.pk") and
 * rejects anything that can't be a store's own domain: the platform's own domain or its
 * subdomains, admin.* hosts, IPs, localhost/vercel.app, malformed names.
 */
export function validateCustomDomain(input: string, rootDomain: string): DomainValidation {
  let host = (input ?? "").trim().toLowerCase();
  host = host.replace(/^[a-z][a-z0-9+.-]*:\/\//, "").split(/[/?#]/)[0].split(":")[0].replace(/\.$/, "");
  if (host.startsWith("www.")) host = host.slice(4);
  if (!host) return { ok: false, error: "Please enter your domain, e.g. mystore.com" };
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return { ok: false, error: "Please enter a domain name, not an IP address." };
  if (!HOSTNAME_PATTERN.test(host)) return { ok: false, error: `"${host}" doesn't look like a valid domain (e.g. mystore.com).` };
  const root = rootDomain.trim().toLowerCase();
  if (root && (host === root || host.endsWith(`.${root}`))) {
    return { ok: false, error: `Please enter your own domain - ${root} addresses are already provided by the platform.` };
  }
  if (host.startsWith("admin.")) {
    return { ok: false, error: "Enter your main domain (e.g. mystore.com) - the admin. address is set up for you automatically." };
  }
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".vercel.app") || host.endsWith(".local")) {
    return { ok: false, error: "That domain can't be used. Please enter a domain you own." };
  }
  if (MULTI_PART_SUFFIXES.has(host)) return { ok: false, error: `"${host}" is a domain extension, not a full domain.` };
  return { ok: true, hostname: host };
}

/** The registrable domain ("shop.glamix.pk" -> "glamix.pk", "glamix.com.pk" -> itself). */
export function registrableDomain(hostname: string): string {
  const labels = hostname.split(".");
  const lastTwo = labels.slice(-2).join(".");
  const keep = MULTI_PART_SUFFIXES.has(lastTwo) ? 3 : 2;
  return labels.slice(-keep).join(".");
}

/** True when the hostname IS the registrable domain (needs an A record - CNAME isn't
 * allowed at the zone apex at most providers). */
export function isApexDomain(hostname: string): boolean {
  return registrableDomain(hostname) === hostname;
}

/** Host label relative to the registrable domain, as registrar DNS panels expect it
 * ("glamix.pk" -> "@", "admin.glamix.pk" -> "admin", "_webriiz-verify.shop.glamix.pk" -> "_webriiz-verify.shop"). */
export function relativeHost(fqdn: string, hostname: string): string {
  const zone = registrableDomain(hostname);
  if (fqdn === zone) return "@";
  return fqdn.endsWith(`.${zone}`) ? fqdn.slice(0, -(zone.length + 1)) : fqdn;
}

export function adminHostFor(hostname: string): string {
  return `admin.${hostname}`;
}

export function wwwHostFor(hostname: string): string | null {
  return isApexDomain(hostname) ? `www.${hostname}` : null;
}

export function ownershipTxtName(hostname: string): string {
  return `${OWNERSHIP_TXT_LABEL}.${hostname}`;
}

export function ownershipTxtValue(token: string): string {
  return `${OWNERSHIP_TXT_PREFIX}${token}`;
}

/** Every DNS record the owner must add, in the order they should add them. */
export function buildDnsRecords(input: {
  hostname: string;
  ownershipToken: string;
  recommendedIPv4?: string;
  recommendedCNAME?: string;
  providerVerification?: { type: string; domain: string; value: string }[];
}): CustomDomainDnsRecord[] {
  const { hostname } = input;
  const ipv4 = input.recommendedIPv4 || DEFAULT_APEX_IPV4;
  const cname = (input.recommendedCNAME || DEFAULT_CNAME_TARGET).replace(/\.$/, "");
  const rec = (purpose: CustomDomainDnsRecord["purpose"], type: CustomDomainDnsRecord["type"], fqdn: string, value: string): CustomDomainDnsRecord => ({
    purpose,
    type,
    host: relativeHost(fqdn, hostname),
    fqdn,
    value,
  });

  const records: CustomDomainDnsRecord[] = [rec("ownership", "TXT", ownershipTxtName(hostname), ownershipTxtValue(input.ownershipToken))];
  if (isApexDomain(hostname)) {
    records.push(rec("storefront", "A", hostname, ipv4));
    records.push(rec("www", "CNAME", `www.${hostname}`, cname));
  } else {
    records.push(rec("storefront", "CNAME", hostname, cname));
  }
  records.push(rec("admin", "CNAME", adminHostFor(hostname), cname));
  for (const v of input.providerVerification ?? []) {
    if (v.type?.toUpperCase() === "TXT" && v.domain && v.value) {
      records.push(rec("provider_verification", "TXT", v.domain.replace(/\.$/, ""), v.value));
    }
  }
  return records;
}

/** Does any TXT record (as returned by dns.resolveTxt - chunks per record) carry the token? */
export function txtRecordsContainToken(records: string[][], token: string): boolean {
  const expected = ownershipTxtValue(token);
  return records.some((chunks) => chunks.join("").trim() === expected);
}

/**
 * The store's live primary custom domain - only when a real check marked it DNS-verified
 * AND SSL-active. Drives redirects off the default {slug}.ROOT_DOMAIN addresses and the
 * customer-facing links; anything short of fully live returns null, so visitors are never
 * sent to a domain that isn't working.
 */
export function getActivePrimaryCustomDomain(store: {
  domains?: string[];
  domainSettings?: Record<string, { isPrimary?: boolean; dnsStatus?: string; sslStatus?: string; redirectPlatformSubdomain?: boolean }>;
}): { hostname: string; redirectPlatformSubdomain: boolean } | null {
  for (const hostname of store.domains ?? []) {
    const s = store.domainSettings?.[hostname];
    if (s?.isPrimary && s.dnsStatus === "verified" && s.sslStatus === "active" && !hostname.startsWith("admin.")) {
      return { hostname, redirectPlatformSubdomain: s.redirectPlatformSubdomain === true };
    }
  }
  return null;
}
