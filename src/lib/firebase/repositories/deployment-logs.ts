import "server-only";
import { adminDb, serverTimestamp } from "../admin";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { DeploymentLog, DeploymentLogLevel } from "@/types/deployment-log";
import type { DeploymentProviderId } from "@/lib/deployment/provider";

const COLLECTION = "deploymentLogs";

/** Root-level, direct-by-id access under stores/{id}/deploymentLogs - mirrors
 * deployment-metadata.ts's getDeploymentMetadataByStoreId() pattern, since Super
 * Admin reads an arbitrary store's logs without a resolved tenant context. */
export async function logDeploymentEvent(
  storeId: string,
  level: DeploymentLogLevel,
  message: string,
  provider?: DeploymentProviderId
): Promise<void> {
  await adminDb()
    .collection("stores")
    .doc(storeId)
    .collection(COLLECTION)
    .add({
      level,
      message,
      ...(provider ? { provider } : {}),
      createdAt: serverTimestamp(),
    });
}

export async function getDeploymentLogs(storeId: string, limit = 10): Promise<DeploymentLog[]> {
  return safeQuery("getDeploymentLogs", [], async () => {
    const snap = await adminDb()
      .collection("stores")
      .doc(storeId)
      .collection(COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snap.docs
      .map((doc) => docData<DeploymentLog>(doc))
      .filter((log): log is DeploymentLog => log !== null);
  });
}
