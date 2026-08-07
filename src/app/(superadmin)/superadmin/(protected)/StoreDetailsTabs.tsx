"use client";

import React, { useState } from "react";
import StoreForm from "./StoreForm";
import OwnerActions from "./OwnerActions";
import StoreStatusActions from "./StoreStatusActions";
import ImpersonateButton from "./ImpersonateButton";
import CloneStoreDialog from "./CloneStoreDialog";
import DeleteStoreDialog from "./DeleteStoreDialog";
import DomainManagementPanel from "./DomainManagementPanel";
import DeploymentPanel from "./DeploymentPanel";
import { STATUS_BADGE_CLASS } from "@/lib/superadmin/status-badge";
import { ACTIVITY_LABELS } from "@/lib/superadmin/activity-labels";
import type { Store } from "@/types/store";
import type { DeploymentMetadata } from "@/types/deployment";
import type { DeploymentLog } from "@/types/deployment-log";
import type { StoreActivityLog } from "@/types/store-activity-log";

// Mirrors themes.ts's DEFAULT_THEME.id - not imported directly since that module is
// "server-only" and this is a client component (themes.ts pulls in the Admin SDK).
const DEFAULT_THEME_ID = "__default__";

const TABS = ["General", "Owner", "Theme", "Domains", "Deployment", "Status"] as const;
type Tab = (typeof TABS)[number];

const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";

const StoreDetailsTabs: React.FC<{
  store: Store;
  activity: StoreActivityLog[];
  deployment: DeploymentMetadata | null;
  deploymentLogs: DeploymentLog[];
  platformBaseUrl: string;
}> = ({ store, activity, deployment, deploymentLogs, platformBaseUrl }) => {
  const [tab, setTab] = useState<Tab>("General");

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex gap-1 border-b border-neutral-200 dark:border-neutral-800">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t
                ? "border-primary-6000 text-primary-6000"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "General" && <StoreForm mode="edit" store={store} platformBaseUrl={platformBaseUrl} />}

      {tab === "Owner" && (
        <div className={cardClass}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-neutral-500">Owner name</span>
              {store.ownerName || "—"}
            </div>
            <div>
              <span className="block text-neutral-500">Owner email</span>
              {store.email || "—"}
            </div>
            <div>
              <span className="block text-neutral-500">Phone</span>
              {store.phone || "—"}
            </div>
          </div>
          <OwnerActions storeId={store.id} />
        </div>
      )}

      {tab === "Theme" && (
        <div className={cardClass}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-neutral-500">Active theme</span>
              {store.themeId === DEFAULT_THEME_ID || !store.themeId ? "Default Theme" : store.themeId}
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Every store starts on the Default Theme. Multiple themes/a theme marketplace are a
            future phase - this is metadata only for now.
          </p>
        </div>
      )}

      {tab === "Domains" && <DomainManagementPanel store={store} platformBaseUrl={platformBaseUrl} />}

      {tab === "Deployment" && (
        <DeploymentPanel
          store={store}
          deployment={deployment}
          platformBaseUrl={platformBaseUrl}
          deploymentLogs={deploymentLogs}
          activity={activity}
        />
      )}

      {tab === "Status" && (
        <div className="space-y-6">
          <div className={cardClass}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-neutral-500">Status</span>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[store.status]}`}>
                  {store.status}
                </span>
              </div>
              <div>
                <span className="block text-neutral-500">Created</span>
                {store.createdAt ? new Date(store.createdAt).toLocaleString() : "—"}
              </div>
              <div>
                <span className="block text-neutral-500">Last updated</span>
                {store.updatedAt ? new Date(store.updatedAt).toLocaleString() : "—"}
              </div>
            </div>
            <StoreStatusActions id={store.id} status={store.status} />
          </div>

          <div className={cardClass}>
            <h2 className="text-lg font-semibold">Store actions</h2>
            <div className="flex flex-wrap gap-3">
              <ImpersonateButton storeId={store.id} />
            </div>
            <CloneStoreDialog sourceStoreId={store.id} platformBaseUrl={platformBaseUrl} />
          </div>

          <div className={cardClass}>
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger zone</h2>
            <DeleteStoreDialog storeId={store.id} slug={store.slug} />
          </div>

          <div className={cardClass}>
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {activity.map((log) => (
                <div key={log.id} className="py-2 text-sm flex items-center justify-between">
                  <span>{ACTIVITY_LABELS[log.action] ?? log.action}</span>
                  <span className="text-xs text-neutral-500">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                  </span>
                </div>
              ))}
              {!activity.length && <p className="text-sm text-neutral-500 py-2">No activity recorded yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetailsTabs;
