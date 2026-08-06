"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { triggerDeployment } from "./actions";
import { buildTenantUrl } from "@/lib/platform/tenant-url";
import { computeDeploymentHealth, type DeploymentHealthStatus } from "@/lib/deployment/health";
import { ACTIVITY_LABELS } from "@/lib/superadmin/activity-labels";
import type { Store } from "@/types/store";
import type { DeploymentMetadata } from "@/types/deployment";
import type { DeploymentLog } from "@/types/deployment-log";
import type { StoreActivityLog, StoreActivityAction } from "@/types/store-activity-log";

const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";

const HEALTH_BADGE_CLASS: Record<DeploymentHealthStatus, string> = {
  healthy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  degraded: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  unhealthy: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  unknown: "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

const LOG_LEVEL_CLASS: Record<string, string> = {
  info: "text-neutral-500",
  warning: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
};

const DEPLOYMENT_ACTIVITY_ACTIONS: StoreActivityAction[] = [
  "domain_removed",
  "domain_reverified",
  "primary_domain_changed",
  "deployment_status_changed",
];

const DeploymentPanel: React.FC<{
  store: Store;
  deployment: DeploymentMetadata | null;
  platformBaseUrl: string;
  deploymentLogs: DeploymentLog[];
  activity: StoreActivityLog[];
}> = ({ store, deployment, platformBaseUrl, deploymentLogs, activity }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleTriggerDeployment = () => {
    startTransition(async () => {
      try {
        await triggerDeployment(store.id);
        toast.success("Deployment requested");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to trigger deployment");
      }
    });
  };

  const health = computeDeploymentHealth(deployment);
  const deploymentHistory = activity.filter((log) => DEPLOYMENT_ACTIVITY_ACTIONS.includes(log.action));

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${HEALTH_BADGE_CLASS[health]}`}>
            {health}
          </span>
          <button
            type="button"
            disabled={isPending}
            onClick={handleTriggerDeployment}
            className="px-3 py-1.5 rounded-full bg-primary-6000 text-white text-xs font-medium disabled:opacity-50"
          >
            Trigger deployment
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block text-neutral-500">Deployment status</span>
            {deployment?.deploymentStatus ?? "not_deployed"}
          </div>
          <div>
            <span className="block text-neutral-500">Build status</span>
            {deployment?.buildStatus ?? "idle"}
          </div>
          <div>
            <span className="block text-neutral-500">Environment</span>
            {deployment?.environmentStatus ?? "development"}
          </div>
          <div>
            <span className="block text-neutral-500">Build version</span>
            {deployment?.buildVersion ?? "—"}
          </div>
          <div>
            <span className="block text-neutral-500">Production URL</span>
            {deployment?.productionUrl || store.websiteUrl || buildTenantUrl(platformBaseUrl, store.slug)}
          </div>
          <div>
            <span className="block text-neutral-500">Preview URL</span>
            {deployment?.previewUrl || "—"}
          </div>
          <div>
            <span className="block text-neutral-500">Last deploy</span>
            {deployment?.lastDeployTime ? new Date(deployment.lastDeployTime).toLocaleString() : "Never"}
          </div>
        </div>
        <p className="text-xs text-neutral-500">
          No real deployment provider is connected yet - this is architecture only, ready
          to swap in a real Vercel/Cloudflare integration behind the same action.
        </p>
      </div>

      <div className={cardClass}>
        <h2 className="text-lg font-semibold">Deployment history</h2>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {deploymentHistory.map((log) => (
            <div key={log.id} className="py-2 text-sm flex items-center justify-between">
              <span>{ACTIVITY_LABELS[log.action] ?? log.action}</span>
              <span className="text-xs text-neutral-500">
                {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
              </span>
            </div>
          ))}
          {!deploymentHistory.length && (
            <p className="text-sm text-neutral-500 py-2">No deployment or domain changes recorded yet.</p>
          )}
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-lg font-semibold">Deployment logs</h2>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {deploymentLogs.map((log) => (
            <div key={log.id} className="py-2 text-sm flex items-center justify-between gap-3">
              <span className={LOG_LEVEL_CLASS[log.level] ?? "text-neutral-500"}>
                {log.provider ? `[${log.provider}] ` : ""}
                {log.message}
              </span>
              <span className="text-xs text-neutral-500 whitespace-nowrap">
                {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
              </span>
            </div>
          ))}
          {!deploymentLogs.length && <p className="text-sm text-neutral-500 py-2">No deployment logs yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default DeploymentPanel;
