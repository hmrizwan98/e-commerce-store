import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData } from "./utils";
import type { DeploymentMetadata } from "@/types/deployment";

const COLLECTION = "deployment";
const DOC_ID = "status";

/** For a future Store-Admin-side dashboard reading its OWN deployment status - resolves
 * the current request's tenant, same pattern as site-settings.ts. Not called yet. */
export async function getDeploymentMetadata(): Promise<DeploymentMetadata | null> {
  const doc = await (await tenantCollection(COLLECTION)).doc(DOC_ID).get();
  return docData<DeploymentMetadata>(doc);
}

/** For the Super Admin Store Details page, which looks up an arbitrary store's deployment
 * status regardless of the current request's own tenant (there isn't one - Super Admin
 * isn't tenant-scoped) - mirrors getStoreById()'s direct-by-id access. */
export async function getDeploymentMetadataByStoreId(storeId: string): Promise<DeploymentMetadata | null> {
  const doc = await adminDb().collection("stores").doc(storeId).collection(COLLECTION).doc(DOC_ID).get();
  return docData<DeploymentMetadata>(doc);
}
