import type { DeploymentProvider, DeploymentProviderId } from "./provider";
import { vercelProvider } from "./providers/vercel";
import { cloudflareProvider } from "./providers/cloudflare";

/** Every known deployment provider, keyed by id - same shape as
 * src/lib/payments/provider-registry.ts's PAYMENT_PROVIDERS map. */
export const DEPLOYMENT_PROVIDERS: Record<DeploymentProviderId, DeploymentProvider> = {
  vercel: vercelProvider,
  cloudflare: cloudflareProvider,
};

/** Single swap point for whichever provider is currently active - same shape as
 * src/lib/email/index.ts's getWelcomeEmailService(). Swapping providers later is
 * a one-line change here, not a change to any caller. */
export function getActiveDeploymentProvider(): DeploymentProvider {
  return DEPLOYMENT_PROVIDERS.vercel;
}
