import type { DomainSetting } from "@/types/domain-settings";
import type { DeploymentMetadata } from "@/types/deployment";

export type DomainHealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";
export type DeploymentHealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

/** Purely computed from already-fetched data - no new Firestore field, no new read. */
export function computeDomainHealth(setting: DomainSetting | undefined): DomainHealthStatus {
  if (!setting) return "unknown";
  if (setting.dnsStatus === "failed" || setting.sslStatus === "failed") return "unhealthy";
  if (setting.dnsStatus === "pending" || setting.sslStatus === "pending") return "degraded";
  return "healthy";
}

/** Purely computed from already-fetched data - no new Firestore field, no new read. */
export function computeDeploymentHealth(deployment: DeploymentMetadata | null): DeploymentHealthStatus {
  if (!deployment || deployment.deploymentStatus === "not_deployed") return "unknown";
  if (deployment.deploymentStatus === "failed" || deployment.buildStatus === "failed") return "unhealthy";
  if (deployment.deploymentStatus === "pending" || deployment.buildStatus === "building") return "degraded";
  return "healthy";
}
