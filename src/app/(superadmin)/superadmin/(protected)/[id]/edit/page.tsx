import React from "react";
import { notFound } from "next/navigation";
import { getStoreById } from "@/lib/firebase/repositories/stores";
import { getRecentActivity } from "@/lib/firebase/repositories/store-activity-logs";
import { getDeploymentMetadataByStoreId } from "@/lib/firebase/repositories/deployment-metadata";
import { getDeploymentLogs } from "@/lib/firebase/repositories/deployment-logs";
import { getPlatformBaseUrl } from "@/lib/platform/base-url";
import StoreDetailsTabs from "../../StoreDetailsTabs";

export const dynamic = "force-dynamic";

export default async function EditStorePage({ params }: { params: { id: string } }) {
  const store = await getStoreById(params.id);
  if (!store) notFound();
  const [activity, deployment, deploymentLogs] = await Promise.all([
    getRecentActivity(store.id, 20),
    getDeploymentMetadataByStoreId(store.id),
    getDeploymentLogs(store.id, 10),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{store.name}</h1>
      <StoreDetailsTabs
        store={store}
        activity={activity}
        deployment={deployment}
        deploymentLogs={deploymentLogs}
        platformBaseUrl={getPlatformBaseUrl()}
      />
    </div>
  );
}
