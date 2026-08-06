export type DnsVerificationStatus = "pending" | "verified" | "failed";
export type SslStatus = "pending" | "active" | "failed";

/**
 * Per-hostname metadata layered on top of Store.domains (kept as a plain string[] since
 * src/lib/tenant/current.ts runs a Firestore array-contains query against it for
 * custom-domain resolution - that shape can't change). Architecture-only: no real DNS/SSL
 * check is performed anywhere yet, see src/lib/superadmin/domain-settings.ts.
 */
export interface DomainSetting {
  hostname: string;
  dnsStatus: DnsVerificationStatus;
  sslStatus: SslStatus;
  isPrimary: boolean;
  redirectTo?: string;
}
