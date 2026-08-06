import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import type { DeploymentMetadata } from "@/types/deployment";

/**
 * Writes the initial stores/{id}/deployment/status doc every store gets at creation -
 * architecture only, no real deploy provider (Vercel/AWS/Firebase Hosting) is called here.
 * productionUrl mirrors the store's own generated subdomain URL; previewUrl is a
 * placeholder string in the same shape a real preview deployment would use.
 */
export async function provisionDeploymentMetadata(
  storeDocRef: FirebaseFirestore.DocumentReference,
  opts: { websiteUrl: string; slug: string; rootDomain: string }
): Promise<void> {
  const metadata: DeploymentMetadata = {
    deploymentStatus: "not_deployed",
    buildStatus: "idle",
    environmentStatus: "development",
    productionUrl: opts.websiteUrl,
    previewUrl: `https://preview-${opts.slug}.${opts.rootDomain}`,
    buildVersion: "0.1.0",
  };

  await storeDocRef
    .collection("deployment")
    .doc("status")
    .set({ ...metadata, updatedAt: FieldValue.serverTimestamp() });
}
