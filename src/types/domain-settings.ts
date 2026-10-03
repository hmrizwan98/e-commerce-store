export type DnsVerificationStatus = "pending" | "verified" | "failed";
export type SslStatus = "pending" | "active" | "failed";

/**
 * Per-hostname metadata layered on top of Store.domains (kept as a plain string[] since
 * src/lib/tenant/current.ts runs a Firestore array-contains query against it for
 * custom-domain resolution - that shape can't change). dnsStatus/sslStatus are set by a
 * real check (src/lib/domains/custom-domain-service.ts) when the deployment provider is
 * configured; they stay "pending" otherwise.
 */
export interface DomainSetting {
  hostname: string;
  dnsStatus: DnsVerificationStatus;
  sslStatus: SslStatus;
  isPrimary: boolean;
  redirectTo?: string;
  /** When true (and the domain is primary, DNS-verified and SSL-active), visitors on the
   * store's default {slug}.ROOT_DOMAIN / admin-{slug}.ROOT_DOMAIN addresses are redirected
   * to this domain. Set when a Store Admin connects their own domain. */
  redirectPlatformSubdomain?: boolean;
  /** Who added it - Store Admin self-service or Super Admin. */
  source?: "store_admin" | "super_admin";
  lastCheckedAt?: number;
}

/** One DNS record the store owner must add at their domain provider. */
export interface CustomDomainDnsRecord {
  purpose: "ownership" | "storefront" | "www" | "admin" | "provider_verification";
  type: "TXT" | "A" | "CNAME";
  /** Host/name exactly as most registrars expect it ("@" = the domain itself). */
  host: string;
  /** Fully-qualified name, for registrars that want the whole hostname. */
  fqdn: string;
  value: string;
}

export type CustomDomainStepState = "pending" | "done" | "error";

/** Result of the last "Check status" run, persisted so the page shows it on reload. */
export interface CustomDomainCheckSnapshot {
  checkedAt: number;
  ownership: CustomDomainStepState;
  providerAdded: CustomDomainStepState;
  dns: CustomDomainStepState;
  ssl: CustomDomainStepState;
  /** Human-readable explanation of what's still missing (never a raw provider error). */
  message: string;
}

/**
 * A Store Admin's self-service request to connect their own domain. Lives on the store
 * doc, OUTSIDE `domains` - the hostname only joins `domains` (and so starts routing to this
 * store) after the owner has proven control of it via the TXT ownership record, so no
 * store can claim a domain it doesn't own.
 */
export interface CustomDomainRequest {
  hostname: string;
  /** Random per-request secret the owner publishes as a TXT record to prove ownership. */
  ownershipToken: string;
  status: "awaiting_dns" | "active";
  requestedAt: number;
  requestedBy: string;
  /** Extra TXT challenges from the hosting provider (e.g. domain used on another Vercel account). */
  providerVerification?: { type: string; domain: string; value: string }[];
  /** Provider-recommended DNS targets, when known (falls back to documented defaults). */
  recommendedIPv4?: string;
  recommendedCNAME?: string;
  lastCheck?: CustomDomainCheckSnapshot;
  activatedAt?: number;
}
