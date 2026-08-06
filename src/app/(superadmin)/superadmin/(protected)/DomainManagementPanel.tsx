"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { setPrimaryDomain, removeDomain, reverifyDomain } from "./actions";
import { buildTenantUrl } from "@/lib/platform/tenant-url";
import { getCustomDomainDnsInstructions, getWildcardDnsInstructions } from "@/lib/deployment/dns-instructions";
import { computeDomainHealth, type DomainHealthStatus } from "@/lib/deployment/health";
import type { Store } from "@/types/store";

const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";

const DNS_BADGE_CLASS: Record<string, string> = {
  pending: "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  verified: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const HEALTH_BADGE_CLASS: Record<DomainHealthStatus, string> = {
  healthy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  degraded: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  unhealthy: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  unknown: "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

const DomainManagementPanel: React.FC<{ store: Store; platformBaseUrl: string }> = ({ store, platformBaseUrl }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedDns, setExpandedDns] = useState<string | null>(null);

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

  const handleRemove = (hostname: string) => {
    startTransition(async () => {
      try {
        await removeDomain(store.id, hostname);
        toast.success(`${hostname} removed`);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to remove domain");
      }
    });
  };

  const handleReverify = (hostname: string) => {
    startTransition(async () => {
      try {
        await reverifyDomain(store.id, hostname);
        toast.success(`Re-verification requested for ${hostname}`);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to re-verify domain");
      }
    });
  };

  const wildcardInstructions = getWildcardDnsInstructions(platformBaseUrl);

  return (
    <div className={cardClass}>
      <p className="text-xs text-neutral-500">
        DNS/SSL verification here is architecture only - no real check is performed yet.
        Re-verify and Trigger deployment call a stub deployment provider, ready to be
        swapped for a real Vercel/Cloudflare integration later.
      </p>
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        <div className="py-2 text-sm flex items-center justify-between">
          <span>{store.websiteUrl ?? buildTenantUrl(platformBaseUrl, store.slug)}</span>
          <span className="text-xs text-neutral-500">Default subdomain (wildcard)</span>
        </div>
        {(store.domains ?? []).map((hostname) => {
          const setting = store.domainSettings?.[hostname];
          const health = computeDomainHealth(setting);
          const isExpanded = expandedDns === hostname;
          return (
            <div key={hostname} className="py-2 space-y-2">
              <div className="text-sm flex items-center justify-between gap-3">
                <span>{hostname}</span>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${HEALTH_BADGE_CLASS[health]}`}>
                    {health}
                  </span>
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
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleReverify(hostname)}
                    className="text-xs font-medium hover:underline disabled:opacity-50"
                  >
                    Re-verify
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setExpandedDns(isExpanded ? null : hostname)}
                    className="text-xs font-medium hover:underline disabled:opacity-50"
                  >
                    DNS setup
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleRemove(hostname)}
                    className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {isExpanded && (
                <div className="rounded-lg bg-neutral-50 dark:bg-neutral-950 p-3 text-xs space-y-1">
                  {getCustomDomainDnsInstructions(hostname, platformBaseUrl).map((record) => (
                    <div key={record.name} className="flex flex-wrap gap-2">
                      <span className="font-mono">{record.type}</span>
                      <span className="font-mono">{record.name}</span>
                      <span className="font-mono">→ {record.value}</span>
                      {record.note && <span className="text-neutral-500">{record.note}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {!store.domains?.length && <p className="text-sm text-neutral-500 py-2">No custom domains yet.</p>}
      </div>

      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <p className="text-xs font-medium mb-1">Wildcard subdomain DNS (platform-level)</p>
        {wildcardInstructions.map((record) => (
          <div key={record.name} className="text-xs flex flex-wrap gap-2 text-neutral-500">
            <span className="font-mono">{record.type}</span>
            <span className="font-mono">{record.name}</span>
            <span className="font-mono">→ {record.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DomainManagementPanel;
