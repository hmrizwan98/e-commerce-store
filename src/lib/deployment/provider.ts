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

export interface DeploymentProvider {
  readonly id: DeploymentProviderId;
  readonly displayName: string;
  verifyDomain(hostname: string): Promise<DomainVerificationResult>;
  triggerDeployment(storeId: string): Promise<DeploymentTriggerResult>;
}
