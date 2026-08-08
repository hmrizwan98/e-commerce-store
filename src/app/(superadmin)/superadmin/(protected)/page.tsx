import React from "react";
import Link from "next/link";
import { getStoreStatusCounts, getRecentStores } from "@/lib/firebase/repositories/stores";
import { STATUS_BADGE_CLASS } from "@/lib/superadmin/status-badge";
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboardPage() {
  const [{ total: totalLiveStores, active: activeCount, suspended: disabledCount }, recentStores] =
    await Promise.all([getStoreStatusCounts(), getRecentStores(5)]);

  const activePct = totalLiveStores ? Math.round((activeCount / totalLiveStores) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-primary-6000/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-primary-400 uppercase">
            <SparklesIcon className="w-4 h-4 text-primary-400" />
            <span>Platform Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Enterprise Control Center</h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
            Monitor multi-tenant store provisioning, platform operations, and tenant lifecycle statuses.
          </p>
        </div>

        <div className="relative flex items-center gap-3 shrink-0">
          <Link
            href={"/superadmin/new" as any}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-6000 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-primary-6000/25 hover:shadow-primary-6000/40 hover:-translate-y-0.5 transition-all"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Store</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Stores Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-500">Total Stores</span>
            <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-6000 dark:text-primary-400 flex items-center justify-center">
              <BuildingStorefrontIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {totalLiveStores}
            </span>
            <span className="text-xs font-mono text-neutral-400">stores provisioned</span>
          </div>
        </div>

        {/* Active Stores Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-emerald-600 dark:text-emerald-400">
              Active Tenants
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {activeCount}
            </span>
            <span className="text-xs font-mono text-emerald-600/80 dark:text-emerald-400/80">({activePct}% operational)</span>
          </div>
        </div>

        {/* Disabled/Suspended Stores Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-red-600 dark:text-red-400">
              Suspended Stores
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600 dark:text-red-400 tracking-tight">
              {disabledCount}
            </span>
            <span className="text-xs font-mono text-neutral-400">requires review</span>
          </div>
        </div>
      </div>

      {/* Recent Stores Table Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">Recent Stores</h2>
            <p className="text-xs text-neutral-500">Latest tenant deployments and active storefronts</p>
          </div>
          <Link
            href={"/superadmin/stores" as any}
            className="inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase text-primary-6000 dark:text-primary-400 hover:underline"
          >
            <span>View All Stores</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {recentStores.map((store) => (
            <div key={store.id} className="flex items-center justify-between py-4 group">
              <div className="space-y-0.5">
                <Link
                  href={`/superadmin/${store.id}/edit` as any}
                  className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-primary-6000 dark:group-hover:text-primary-400 transition-colors"
                >
                  {store.name}
                </Link>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
                  <span>slug: {store.slug}</span>
                  <span>•</span>
                  <span>owner: {store.ownerName || "Unassigned"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[store.status]}`}>
                  {store.status}
                </span>
                <Link
                  href={`/superadmin/${store.id}/edit` as any}
                  className="hidden sm:inline-flex px-3 py-1 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))}
          {!recentStores.length && <p className="text-sm text-neutral-500 py-6 text-center">No stores provisioned yet.</p>}
        </div>
      </div>
    </div>
  );
}

