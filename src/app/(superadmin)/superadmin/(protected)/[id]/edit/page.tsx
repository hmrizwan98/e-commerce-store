import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreById } from "@/lib/firebase/repositories/stores";
import { getRecentActivity } from "@/lib/firebase/repositories/store-activity-logs";
import { getDeploymentMetadataByStoreId } from "@/lib/firebase/repositories/deployment-metadata";
import { getDeploymentLogs } from "@/lib/firebase/repositories/deployment-logs";
import { getPlatformBaseUrl } from "@/lib/platform/base-url";
import { STATUS_BADGE_CLASS } from "@/lib/superadmin/status-badge";
import StoreDetailsTabs from "../../StoreDetailsTabs";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">
        <div className="space-y-1">
          <Link
            href={"/superadmin/stores" as any}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-1"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Back to Store Directory</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{store.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[store.status]}`}>
              {store.status}
            </span>
          </div>
          <p className="text-xs font-mono text-neutral-500">Tenant Slug: {store.slug} • Store ID: {store.id}</p>
        </div>
      </div>

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

