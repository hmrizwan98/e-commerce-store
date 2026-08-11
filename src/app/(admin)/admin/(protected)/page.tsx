import React from "react";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { getInventoryProducts } from "@/lib/firebase/repositories/products";
import { getOrderStats, getTopSellingProducts, getRevenueTrend } from "@/lib/firebase/repositories/orders";
import { getCustomerCount } from "@/lib/firebase/repositories/customers";
import { getOnboardingProgress } from "@/lib/firebase/repositories/onboarding";
import OnboardingWelcomeCard from "@/components/admin/OnboardingWelcomeCard";
import {
  ChartBarIcon,
  TruckIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  BuildingStorefrontIcon,
  CircleStackIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

async function countCollection(name: string, filter?: [string, FirebaseFirestore.WhereFilterOp, unknown]) {
  let query: FirebaseFirestore.Query = adminDb().collection(name);
  if (filter) query = query.where(...filter);
  const snap = await query.count().get();
  return snap.data().count;
}

export default async function AdminDashboardPage() {
  const [productCount, categoryCount, brandCount, orderStats, customerCount, inventory, topSelling, revenueTrend, onboardingProgress] =
    await Promise.all([
      countCollection("products", ["isDeleted", "==", false]),
      countCollection("categories", ["isDeleted", "==", false]),
      countCollection("brands", ["isDeleted", "==", false]),
      getOrderStats(),
      getCustomerCount(),
      getInventoryProducts(),
      getTopSellingProducts(5),
      getRevenueTrend(14),
      getOnboardingProgress(),
    ]);

  const lowStock = inventory.filter((p) => p.stock <= (p.lowStockThreshold ?? 5)).slice(0, 8);
  const maxRevenue = Math.max(1, ...revenueTrend.map((p) => p.revenue));

  return (
    <div className="space-y-8">
      {/* Top Banner Greeting Card matching input_file_2.png */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-indigo-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Good Evening, Ginyaki</span>
            <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Here&apos;s what&apos;s happening with your store today. You have <span className="font-bold text-slate-900 dark:text-white">1 branch</span> actively receiving orders.
          </p>
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
            Multi-Store Network
          </span>
        </div>
      </div>

      <OnboardingWelcomeCard progress={onboardingProgress} />

      {/* KPI Stats Row matching input_file_2.png */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* LOCATIONS STATUS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-400">LOCATIONS STATUS</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">1</div>
            <span className="text-xs text-sky-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-500" /> 1 Online
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center">
            <BuildingStorefrontIcon className="w-6 h-6" />
          </div>
        </div>

        {/* CATALOG INTEGRITY */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-400">CATALOG INTEGRITY</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">100%</div>
            <span className="text-xs text-emerald-600 font-medium">Optimal</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-extrabold text-sm">
            ✓
          </div>
        </div>

        {/* ACTIVE PROMOS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-400">ACTIVE PROMOS</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{categoryCount}</div>
            <span className="text-xs text-indigo-500 font-medium">Categories Configured</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
            <TagIcon className="w-6 h-6" />
          </div>
        </div>

        {/* TOTAL CAMPAIGNS / REVENUE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-400">TOTAL REVENUE</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">${orderStats.totalRevenue.toFixed(0)}</div>
            <span className="text-xs text-rose-500 font-medium">{orderStats.totalOrders} total orders</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
            <ChartBarIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Catalogue Health & Stats Section matching input_file_1.png */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <CircleStackIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Catalogue health</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center">
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{lowStock.length}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400 mt-1">LOW STOCK ITEMS</div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center">
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">0</div>
              <div className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400 mt-1">IMG DEFICIT (ITEMS)</div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center">
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">0</div>
              <div className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400 mt-1">DORMANT SECTIONS</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{brandCount}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400 mt-1">BRANDS</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{categoryCount}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400 mt-1">ACTIVE SECTIONS</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{productCount}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400 mt-1">ACTIVE ITEMS</div>
            </div>
          </div>
        </div>

        {/* Architecture Box matching input_file_1.png */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Architecture</h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase font-mono text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40">
              DECENTRALIZED
            </span>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
            <div className="flex justify-between pt-2">
              <span className="text-slate-500 font-medium">Delivery Nodes</span>
              <span className="font-bold text-slate-900 dark:text-white">1</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500 font-medium">Dine-in Nodes</span>
              <span className="font-bold text-slate-900 dark:text-white">0</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500 font-medium">Pickup Nodes</span>
              <span className="font-bold text-slate-900 dark:text-white">1</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500 font-medium">Customers</span>
              <span className="font-bold text-slate-900 dark:text-white">{customerCount}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500 font-medium">Global Notices</span>
              <span className="font-bold text-amber-500">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid matching input_file_1.png */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link href={"/admin/analytics" as any} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm hover:shadow-md border border-slate-200/80 dark:border-slate-800 text-center space-y-4 group transition-all">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
            <ChartBarIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Deep Analytics</h3>
            <p className="text-xs text-slate-400 mt-1">Comprehensive telemetry</p>
          </div>
        </Link>

        <Link href={"/admin/orders" as any} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm hover:shadow-md border border-slate-200/80 dark:border-slate-800 text-center space-y-4 group transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
            <TruckIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Order Stream</h3>
            <p className="text-xs text-slate-400 mt-1">Live transaction feed</p>
          </div>
        </Link>

        <Link href={"/admin/settings" as any} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm hover:shadow-md border border-slate-200/80 dark:border-slate-800 text-center space-y-4 group transition-all">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
            <Cog6ToothIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">System Config</h3>
            <p className="text-xs text-slate-400 mt-1">Global parameters</p>
          </div>
        </Link>

        <Link href={"/admin/faqs" as any} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm hover:shadow-md border border-slate-200/80 dark:border-slate-800 text-center space-y-4 group transition-all">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
            <QuestionMarkCircleIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Support Hub</h3>
            <p className="text-xs text-slate-400 mt-1">Direct assistance</p>
          </div>
        </Link>
      </div>

      {/* Revenue Trend & Top Sellers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Revenue (last 14 days)</h2>
          {revenueTrend.some((p) => p.revenue > 0) ? (
            <div className="flex items-end gap-1.5 h-40">
              {revenueTrend.map((p) => (
                <div key={p.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div
                    className="w-full bg-indigo-600 rounded-t-md"
                    style={{ height: `${Math.max(2, (p.revenue / maxRevenue) * 100)}%` }}
                    title={`${p.date}: $${p.revenue.toFixed(2)}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-10 text-center">No paid orders in this period yet.</p>
          )}
          <div className="flex justify-between text-xs font-mono text-slate-400 mt-2">
            <span>{revenueTrend[0]?.date}</span>
            <span>{revenueTrend[revenueTrend.length - 1]?.date}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Top selling products</h2>
          {topSelling.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topSelling.map((p) => (
                <div key={p.productId} className="flex justify-between py-3 text-sm">
                  <span className="font-medium text-slate-900 dark:text-white">{p.name}</span>
                  <span className="text-slate-500 font-mono">
                    {p.quantitySold} sold · ${p.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-10 text-center">No sales yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

