import React from "react";
import Link from "next/link";
import { getStores } from "@/lib/firebase/repositories/stores";
import { STATUS_BADGE_CLASS } from "@/lib/superadmin/status-badge";

export const dynamic = "force-dynamic";

const widgetCardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6";

export default async function SuperAdminDashboardPage() {
  // Single read - every widget below is derived in-memory from this one list.
  const allStores = await getStores({ includeArchived: true });
  const liveStores = allStores.filter((s) => s.status !== "archived");
  const activeCount = liveStores.filter((s) => s.status === "active").length;
  const disabledCount = liveStores.filter((s) => s.status === "suspended").length;
  const recentStores = liveStores.slice(0, 5);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={widgetCardClass}>
          <div className="text-sm text-neutral-500">Total Stores</div>
          <div className="text-3xl font-semibold mt-1">{liveStores.length}</div>
        </div>
        <div className={widgetCardClass}>
          <div className="text-sm text-neutral-500">Active Stores</div>
          <div className="text-3xl font-semibold mt-1 text-green-600">{activeCount}</div>
        </div>
        <div className={widgetCardClass}>
          <div className="text-sm text-neutral-500">Disabled Stores</div>
          <div className="text-3xl font-semibold mt-1 text-red-600">{disabledCount}</div>
        </div>
      </div>

      <div className={widgetCardClass}>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={"/superadmin/new" as any}
            className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium"
          >
            Create store
          </Link>
          <Link
            href={"/superadmin/stores" as any}
            className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
          >
            Manage stores
          </Link>
        </div>
      </div>

      <div className={widgetCardClass}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Stores</h2>
          <Link href={"/superadmin/stores" as any} className="text-sm font-medium hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {recentStores.map((store) => (
            <div key={store.id} className="flex items-center justify-between py-3">
              <div>
                <Link href={`/superadmin/${store.id}/edit` as any} className="font-medium hover:underline">
                  {store.name}
                </Link>
                <div className="text-xs text-neutral-500">{store.slug}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[store.status]}`}>
                {store.status}
              </span>
            </div>
          ))}
          {!recentStores.length && <p className="text-sm text-neutral-500 py-3">No stores yet.</p>}
        </div>
      </div>
    </div>
  );
}
