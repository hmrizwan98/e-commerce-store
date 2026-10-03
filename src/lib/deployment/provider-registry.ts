import "server-only";
import type { DeploymentProvider, DeploymentProviderId } from "./provider";
import { createVercelProvider, vercelConfigFromEnv } from "./providers/vercel";
import { cloudflareProvider } from "./providers/cloudflare";
import { createStubDeploymentProvider } from "./stub-provider";

const vercelStub = createStubDeploymentProvider("vercel", "Vercel");

/** Vercel is real when VERCEL_API_TOKEN + VERCEL_PROJECT_ID are set; otherwise its stub
 * reports "not configured" for every domain op instead of pretending to succeed. */
function vercel(): DeploymentProvider {
  const config = vercelConfigFromEnv();
  return config ? createVercelProvider(config) : vercelStub;
}

/** Every known deployment provider, keyed by id - same shape as
 * src/lib/payments/provider-registry.ts's PAYMENT_PROVIDERS map. */
export function getDeploymentProvider(id: DeploymentProviderId): DeploymentProvider {
  return id === "vercel" ? vercel() : cloudflareProvider;
}

/** Single swap point for whichever provider is currently active. */
export function getActiveDeploymentProvider(): DeploymentProvider {
  return vercel();
}
