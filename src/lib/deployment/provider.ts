import type { DnsVerificationStatus, SslStatus } from "@/types/domain-settings";

/** Multi-deployment Provider Architecture - interfaces only, no live integrations.
 * Same shape as src/lib/payments/provider.ts - forward-looking scaffolding for a
 * future real Vercel/Cloudflare integration, exercised today only through the
 * stub implementations in providers/. */

export type DeploymentProviderId = "vercel" | "cloudflare";

export interface DomainVerificationResult {
  verified: boolean;
  dnsStatus: DnsVerificationStatus;
  sslStatus: SslStatus;
  message: string;
}

export interface DeploymentTriggerResult {
  success: boolean;
  deploymentId?: string;
  message: string;
}

/** A hostname's state on the hosting provider. */
export interface ProviderDomainStatus {
  /** The hostname is attached to this platform's project on the provider. */
  attached: boolean;
  /** The provider accepts the hostname for this project (no outstanding ownership challenge). */
  verified: boolean;
  /** DNS doesn't point at the provider yet (or a TLS certificate can't be issued). */
  misconfigured: boolean;
  /** Extra TXT challenges the provider requires (e.g. domain in use on another account). */
  verification: { type: string; domain: string; value: string }[];
  recommendedIPv4?: string;
  recommendedCNAME?: string;
  /** Safe-to-display reason when the provider call itself failed. */
  error?: string;
}

export interface ProviderDomainOpResult {
  ok: boolean;
  /** Safe-to-display reason (never a raw token/response). */
  error?: string;
}

export interface DeploymentProvider {
  readonly id: DeploymentProviderId;
  readonly displayName: string;
  /** False when the provider's credentials aren't set - every domain op then reports that
   * clearly instead of pretending to succeed. */
  isConfigured(): boolean;
  verifyDomain(hostname: string): Promise<DomainVerificationResult>;
  triggerDeployment(storeId: string): Promise<DeploymentTriggerResult>;
  /** Attach a hostname to the platform project; idempotent (already attached = ok). */
  addDomain(hostname: string, opts?: { redirectTo?: string }): Promise<ProviderDomainOpResult>;
  getDomainStatus(hostname: string): Promise<ProviderDomainStatus>;
  /** Ask the provider to re-check its ownership challenge (after the owner added the TXT). */
  verifyDomainChallenge(hostname: string): Promise<ProviderDomainOpResult>;
  /** Detach a hostname; idempotent (not attached = ok). */
  removeDomain(hostname: string): Promise<ProviderDomainOpResult>;
}
