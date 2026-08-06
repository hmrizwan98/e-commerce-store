import "server-only";
import type {
  DeploymentProvider,
  DeploymentProviderId,
  DomainVerificationResult,
  DeploymentTriggerResult,
} from "./provider";

/** Shared stub factory - same shape as src/lib/payments/stub-provider.ts. Every
 * provider below returns the same clearly-labeled not-yet-implemented result,
 * avoiding near-identical bodies per provider. */
export function createStubDeploymentProvider(id: DeploymentProviderId, displayName: string): DeploymentProvider {
  const notImplemented = `${displayName} integration is architecture-only - not yet implemented.`;
  return {
    id,
    displayName,
    async verifyDomain(): Promise<DomainVerificationResult> {
      return { verified: false, dnsStatus: "pending", sslStatus: "pending", message: notImplemented };
    },
    async triggerDeployment(): Promise<DeploymentTriggerResult> {
      return { success: false, message: notImplemented };
    },
  };
}
