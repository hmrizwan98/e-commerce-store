import React from "react";
import { getPlatformFinancialDashboard } from "@/lib/firebase/services/platform-finance-service";
import { getStores } from "@/lib/firebase/repositories/stores";
import { getAllPayouts } from "@/lib/firebase/repositories/payouts";
import PayoutManagementPanel from "./PayoutManagementPanel";

export const dynamic = "force-dynamic";

const widgetCardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6";

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default async function SuperAdminFinancePage() {
  const [dashboard, stores, payouts] = await Promise.all([
    getPlatformFinancialDashboard(),
    getStores({ includeArchived: true }),
    getAllPayouts(),
  ]);

  const stats: { label: string; value: string }[] = [
    { label: "Total Platform Revenue", value: money(dashboard.totalRevenue) },
    { label: "Total Commission", value: money(dashboard.totalCommission) },
    { label: "Active Stores", value: String(dashboard.activeStores) },
    { label: "Pending Payouts", value: money(dashboard.pendingPayouts) },
    { label: "Monthly Revenue", value: money(dashboard.monthlyRevenue) },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Finance</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={widgetCardClass}>
            <div className="text-sm text-neutral-500">{s.label}</div>
            <div className="text-3xl font-semibold mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className={widgetCardClass}>
        <h2 className="text-lg font-semibold mb-4">Top Stores</h2>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {dashboard.topStores.map((s, i) => (
            <div key={s.storeId} className="flex items-center justify-between py-3">
              <span className="font-medium">
                {i + 1}. {s.storeName}
              </span>
              <span>{money(s.revenue)}</span>
            </div>
          ))}
          {!dashboard.topStores.length && <p className="text-sm text-neutral-500 py-3">No revenue recorded yet.</p>}
        </div>
      </div>

      <PayoutManagementPanel
        payouts={payouts}
        stores={stores.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
