import React from "react";
import { getPlatformFinancialDashboard } from "@/lib/firebase/services/platform-finance-service";
import { getStores } from "@/lib/firebase/repositories/stores";
import { getAllPayouts } from "@/lib/firebase/repositories/payouts";
import PayoutManagementPanel from "./PayoutManagementPanel";
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  ChartBarSquareIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

function money(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function SuperAdminFinancePage() {
  const [dashboard, stores, payouts] = await Promise.all([
    getPlatformFinancialDashboard(),
    getStores({ includeArchived: true }),
    getAllPayouts(),
  ]);

  const stats = [
    { label: "Platform Revenue", value: money(dashboard.totalRevenue), icon: CurrencyDollarIcon, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Platform Commission", value: money(dashboard.totalCommission), icon: BanknotesIcon, color: "text-indigo-500 bg-indigo-500/10" },
    { label: "Active Stores", value: String(dashboard.activeStores), icon: BuildingStorefrontIcon, color: "text-blue-500 bg-blue-500/10" },
    { label: "Pending Payouts", value: money(dashboard.pendingPayouts), icon: ClockIcon, color: "text-amber-500 bg-amber-500/10" },
    { label: "Monthly Revenue", value: money(dashboard.monthlyRevenue), icon: ChartBarSquareIcon, color: "text-cyan-500 bg-cyan-500/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Finance & Platform Payouts</h1>
        <p className="text-xs text-neutral-500">Track platform commission, revenue share, and payout schedules</p>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-500">{s.label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{s.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Stores Leaderboard */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <TrophyIcon className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">Top Performing Stores</h2>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {dashboard.topStores.map((s, i) => (
            <div key={s.storeId} className="flex items-center justify-between py-3 font-mono text-xs">
              <span className="font-bold text-neutral-900 dark:text-white">
                #{i + 1} &nbsp; {s.storeName}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{money(s.revenue)}</span>
            </div>
          ))}
          {!dashboard.topStores.length && <p className="text-xs text-neutral-500 py-3">No revenue recorded yet.</p>}
        </div>
      </div>

      {/* Payout Management Panel */}
      <PayoutManagementPanel
        payouts={payouts}
        stores={stores.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}

