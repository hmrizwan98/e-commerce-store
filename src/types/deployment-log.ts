import type { DeploymentProviderId } from "@/lib/deployment/provider";

export type DeploymentLogLevel = "info" | "warning" | "error";

/** Architecture only - a place for a future real Vercel/Cloudflare integration to
 * write build/deploy log lines. Written today by the stub provider results in
 * reverifyDomain()/triggerDeployment() (see actions.ts), so the shape is real and
 * exercised even though no genuine provider is wired up yet. */
export interface DeploymentLog {
  id: string;
  level: DeploymentLogLevel;
  message: string;
  provider?: DeploymentProviderId;
  createdAt?: number;
}
