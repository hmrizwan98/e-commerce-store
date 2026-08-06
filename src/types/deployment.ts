export type DeploymentStatus = "not_deployed" | "pending" | "deployed" | "failed";
export type BuildStatus = "idle" | "building" | "success" | "failed";
export type EnvironmentStatus = "development" | "staging" | "production";

/**
 * Architecture-only scaffolding for a future real deploy pipeline (Vercel/AWS/Firebase
 * Hosting) - nothing here is wired to a real provider yet. See
 * src/lib/firebase/services/deployment-provisioner.ts for the initial values every
 * store gets at creation.
 */
export interface DeploymentMetadata {
  deploymentStatus: DeploymentStatus;
  productionUrl?: string;
  previewUrl?: string;
  buildVersion?: string;
  lastDeployTime?: number;
  buildStatus: BuildStatus;
  environmentStatus: EnvironmentStatus;
  updatedAt?: number;
}
