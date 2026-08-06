"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import StoreForm from "./StoreForm";
import OwnerActions from "./OwnerActions";
import StoreStatusActions from "./StoreStatusActions";
import ImpersonateButton from "./ImpersonateButton";
import CloneStoreDialog from "./CloneStoreDialog";
import { setPrimaryDomain } from "./actions";
import { STATUS_BADGE_CLASS } from "@/lib/superadmin/status-badge";
import type { Store } from "@/types/store";
import type { DeploymentMetadata } from "@/types/deployment";
import type { StoreActivityLog } from "@/types/store-activity-log";

// Mirrors themes.ts's DEFAULT_THEME.id - not imported directly since that module is
// "server-only" and this is a client component (themes.ts pulls in the Admin SDK).
const DEFAULT_THEME_ID = "__default__";

const TABS = ["General", "Owner", "Theme", "Domains", "Deployment", "Status"] as const;
type Tab = (typeof TABS)[number];

const DNS_BADGE_CLASS: Record<string, string> = {
  pending: "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  verified: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const ACTIVITY_LABELS: Record<string, string> = {
  created: "Store created",
  updated: "Store details updated",
  suspended: "Store suspended",
  activated: "Store activated",
  archived: "Store archived",
  restored: "Store restored",
  ownership_changed: "Ownership changed",
  theme_changed: "Theme changed",
  password_reset: "Admin password reset",
  welcome_email_resent: "Welcome email resent",
  cloned: "Cloned from another store",
  impersonated: "Super Admin logged in as store owner",
};

const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";

const StoreDetailsTabs: React.FC<{
  store: Store;
  activity: StoreActivityLog[];
  deployment: DeploymentMetadata | null;
}> = ({ store, activity, deployment }) => {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("General");
  const [isPending, startTransition] = useTransition();

  const handleSetPrimary = (hostname: string) => {
    startTransition(async () => {
      try {
        await setPrimaryDomain(store.id, hostname);
        toast.success(`${hostname} is now the primary domain`);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to set primary domain");
      }
    });
  };

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

      {tab === "General" && <StoreForm mode="edit" store={store} />}

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

      {tab === "Domains" && (
        <div className={cardClass}>
          <p className="text-xs text-neutral-500">
            Add or remove domains from the General tab. DNS/SSL verification here is
            architecture only - no real check is performed yet.
          </p>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            <div className="py-2 text-sm flex items-center justify-between">
              <span>{store.slug}.yourdomain.com</span>
              <span className="text-xs text-neutral-500">Default subdomain</span>
            </div>
            {(store.domains ?? []).map((hostname) => {
              const setting = store.domainSettings?.[hostname];
              return (
                <div key={hostname} className="py-2 text-sm flex items-center justify-between gap-3">
                  <span>{hostname}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DNS_BADGE_CLASS[setting?.dnsStatus ?? "pending"]}`}>
                      DNS: {setting?.dnsStatus ?? "pending"}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DNS_BADGE_CLASS[setting?.sslStatus ?? "pending"]}`}>
                      SSL: {setting?.sslStatus ?? "pending"}
                    </span>
                    {setting?.isPrimary ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-6000 text-white">Primary</span>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSetPrimary(hostname)}
                        className="text-xs font-medium hover:underline disabled:opacity-50"
                      >
                        Set primary
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {!store.domains?.length && <p className="text-sm text-neutral-500 py-2">No custom domains yet.</p>}
          </div>
        </div>
      )}

      {tab === "Deployment" && (
        <div className={cardClass}>
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
              {deployment?.productionUrl || store.websiteUrl || "—"}
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
            No real deployment provider is connected yet - this is architecture only.
          </p>
        </div>
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
            <CloneStoreDialog sourceStoreId={store.id} />
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
