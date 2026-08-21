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
import {
  Cog6ToothIcon,
  UserIcon,
  SwatchIcon,
  GlobeAltIcon,
  CloudArrowUpIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";

const DEFAULT_THEME_ID = "__default__";

const TABS: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "General", label: "General", icon: Cog6ToothIcon },
  { id: "Owner", label: "Owner", icon: UserIcon },
  { id: "Theme", label: "Theme", icon: SwatchIcon },
  { id: "Domains", label: "Domains", icon: GlobeAltIcon },
  { id: "Deployment", label: "Deployment", icon: CloudArrowUpIcon },
  { id: "Status", label: "Lifecycle & Actions", icon: ShieldExclamationIcon },
];

type Tab = "General" | "Owner" | "Theme" | "Domains" | "Deployment" | "Status";

const cardClass =
  "p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-5";

const StoreDetailsTabs: React.FC<{
  store: Store;
  activity: StoreActivityLog[];
  deployment: DeploymentMetadata | null;
  deploymentLogs: DeploymentLog[];
  platformBaseUrl: string;
}> = ({ store, activity, deployment, deploymentLogs, platformBaseUrl }) => {
  const [tab, setTab] = useState<Tab>("General");

  return (
    <div className="space-y-6">
      {/* Pill Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm overflow-x-auto">
        {TABS.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as Tab)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                active
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {tab === "General" && <StoreForm mode="edit" store={store} platformBaseUrl={platformBaseUrl} />}

      {tab === "Owner" && (
        <div className={cardClass}>
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Owner Information</h2>
            <p className="text-xs text-neutral-500">Contact details and store administrator credentials</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-xs font-mono p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60">
            <div>
              <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Owner Name</span>
              <span className="text-neutral-900 dark:text-white font-medium">{store.ownerName || "—"}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Owner Email</span>
              <span className="text-neutral-900 dark:text-white font-medium">{store.email || "—"}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Phone Number</span>
              <span className="text-neutral-900 dark:text-white font-medium">{store.phone || "—"}</span>
            </div>
          </div>
          <div className="pt-2">
            <OwnerActions storeId={store.id} />
          </div>
        </div>
      )}

      {tab === "Theme" && (
        <div className={cardClass}>
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Storefront Theme Preset</h2>
            <p className="text-xs text-neutral-500 font-mono">Current active theme metadata</p>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-bold uppercase font-mono text-neutral-400">Active Theme ID</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-white">
                {store.themeId === DEFAULT_THEME_ID || !store.themeId ? "Default Theme" : store.themeId}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-primary-500/10 text-primary-6000 dark:text-primary-400 border border-primary-500/20">
              Active Preset
            </span>
          </div>
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
          {/* Lifecycle Overview */}
          <div className={cardClass}>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Tenant Lifecycle & Status</h2>
              <p className="text-xs text-neutral-500">Manage tenant active states and provisioning logs</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 text-xs font-mono p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60">
              <div>
                <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Status</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[store.status]}`}>
                  {store.status}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Created Date</span>
                <span className="text-neutral-900 dark:text-white">{store.createdAt ? new Date(store.createdAt).toLocaleString() : "—"}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Last Activity</span>
                <span className="text-neutral-900 dark:text-white">{store.updatedAt ? new Date(store.updatedAt).toLocaleString() : "—"}</span>
              </div>
            </div>
            <StoreStatusActions id={store.id} status={store.status} />
          </div>

          {/* Quick Actions & Cloning */}
          <div className={cardClass}>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Store Operations & Impersonation</h2>
            <div className="flex flex-wrap gap-3">
              <ImpersonateButton storeId={store.id} slug={store.slug} />
            </div>
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <CloneStoreDialog sourceStoreId={store.id} platformBaseUrl={platformBaseUrl} />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-6 sm:p-8 rounded-3xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/30 space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-red-600 dark:text-red-400 flex items-center gap-2">
                <ShieldExclamationIcon className="w-5 h-5" />
                <span>Danger Zone</span>
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Irreversible administrative operations for this tenant
              </p>
            </div>
            <DeleteStoreDialog storeId={store.id} slug={store.slug} />
          </div>

          {/* Activity Log */}
          <div className={cardClass}>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Recent Activity Log</h2>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {activity.map((log) => (
                <div key={log.id} className="py-3 text-xs flex items-center justify-between font-mono">
                  <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                    {ACTIVITY_LABELS[log.action] ?? log.action}
                  </span>
                  <span className="text-neutral-400">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                  </span>
                </div>
              ))}
              {!activity.length && <p className="text-xs text-neutral-500 py-3">No activity recorded yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetailsTabs;


