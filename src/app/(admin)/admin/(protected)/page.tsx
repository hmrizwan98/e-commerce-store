import React from "react";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { getInventoryProducts } from "@/lib/firebase/repositories/products";
import { getOrderStats, getTopSellingProducts, getRevenueTrend, searchAdminOrders } from "@/lib/firebase/repositories/orders";
import { getCustomerCount } from "@/lib/firebase/repositories/customers";
import { getGeneralSettings } from "@/lib/firebase/repositories/site-settings";
import { getCurrentTenant } from "@/lib/tenant/current";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  CubeIcon,
  UsersIcon,
  PlusIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  TruckIcon,
  Cog6ToothIcon,
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
  const [
    productCount,
    categoryCount,
    brandCount,
    orderStats,
    customerCount,
    inventory,
    topSelling,
    revenueTrend,
    recentOrdersResult,
    general,
    tenant,
  ] = await Promise.all([
    countCollection("products", ["isDeleted", "==", false]),
    countCollection("categories", ["isDeleted", "==", false]),
    countCollection("brands", ["isDeleted", "==", false]),
    getOrderStats(),
    getCustomerCount(),
    getInventoryProducts(),
    getTopSellingProducts(5),
    getRevenueTrend(14),
    searchAdminOrders({ pageSize: 5 }),
    getGeneralSettings(),
    getCurrentTenant(),
  ]);

  const lowStockProducts = inventory.filter((p) => p.stock <= (p.lowStockThreshold ?? 5));
  const maxRevenue = Math.max(1, ...revenueTrend.map((p) => p.revenue));

  const storeName = general.storeName || tenant?.brandName || tenant?.name || "Store Owner";
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-8">
      {/* 1. Header Banner Greeting Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-indigo-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{timeGreeting}, {storeName}</span>
            <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Welcome to your store overview. Here is your live business performance summary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Online Store Active
          </span>
          {orderStats.pendingOrders > 0 && (
            <Link
              href="/admin/orders?status=pending"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800 hover:bg-amber-100 transition-all"
            >
              ⚡ {orderStats.pendingOrders} Pending Order{orderStats.pendingOrders > 1 ? "s" : ""}
            </Link>
          )}
        </div>
      </div>

      {/* 2. Executive 4-KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* TOTAL REVENUE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-400">TOTAL REVENUE</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              ${orderStats.totalRevenue.toFixed(2)}
            </div>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircleIcon className="w-3.5 h-3.5" /> From paid orders
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <CurrencyDollarIcon className="w-6 h-6" />
          </div>
        </div>

        {/* TOTAL ORDERS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-400">TOTAL ORDERS</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {orderStats.totalOrders}
            </div>
            <span className="text-xs text-amber-600 font-medium font-mono">
              {orderStats.pendingOrders} Pending Action
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
            <ShoppingBagIcon className="w-6 h-6" />
          </div>
        </div>

        {/* TOTAL PRODUCTS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-400">ACTIVE PRODUCTS</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{productCount}</div>
            <span className="text-xs text-indigo-500 font-medium">
              {categoryCount} Categories · {brandCount} Brands
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0">
            <CubeIcon className="w-6 h-6" />
          </div>
        </div>

        {/* TOTAL CUSTOMERS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-400">TOTAL CUSTOMERS</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{customerCount}</div>
            <span className="text-xs text-sky-600 font-medium">Store Buyers</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center shrink-0">
            <UsersIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/products/new"
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xs hover:shadow-md border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5 group transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <PlusIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Add Product</h3>
            <p className="text-[11px] text-slate-400">New Item</p>
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xs hover:shadow-md border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5 group transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <TruckIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Manage Orders</h3>
            <p className="text-[11px] text-slate-400">Fulfillment</p>
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xs hover:shadow-md border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5 group transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <TagIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Categories</h3>
            <p className="text-[11px] text-slate-400">Organize</p>
          </div>
        </Link>

        <Link
          href="/admin/settings"
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xs hover:shadow-md border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5 group transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <Cog6ToothIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Settings</h3>
            <p className="text-[11px] text-slate-400">Store Config</p>
          </div>
        </Link>
      </div>

      {/* 4. Main 2-Column Grid: Recent Orders Live Feed & Low Stock Inventory Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Live Table (7 Columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Orders Feed</h2>
              <p className="text-xs text-slate-400">Latest transactions from your storefront</p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
            >
              <span>View All</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Order</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentOrdersResult.orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      #{o.orderNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                        {o.shippingAddress?.fullName || o.guestName || "Guest"}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          o.orderStatus === "pending"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : o.orderStatus === "delivered"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : o.orderStatus === "cancelled"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                        }`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                      ${o.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>Manage</span>
                        <ArrowRightIcon className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {!recentOrdersResult.orders.length && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic text-xs">
                      No recent orders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock & Catalogue Health Alert (5 Columns) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Inventory Health</h2>
              </div>
              <Link
                href="/admin/inventory"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Manage Inventory
              </Link>
            </div>

            <div className="space-y-2">
              {lowStockProducts.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs"
                >
                  <div className="truncate min-w-0 pr-2">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      Stock remaining: <span className="font-mono font-bold">{p.stock} units</span>
                    </p>
                  </div>
                  <Link
                    href={`/admin/products/${p.id}` as any}
                    className="shrink-0 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800 text-[11px] hover:bg-amber-100 transition-colors"
                  >
                    Restock
                  </Link>
                </div>
              ))}

              {!lowStockProducts.length && (
                <div className="p-6 text-center rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                  <CheckCircleIcon className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-xs text-emerald-800 dark:text-emerald-300">All Stock Levels Healthy!</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">No products are currently below low stock threshold.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Products</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">{productCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Categories</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">{categoryCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Brands</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">{brandCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Revenue Trend & Top Sellers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Revenue (Last 14 Days)</h2>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
              Total: ${orderStats.totalRevenue.toFixed(0)}
            </span>
          </div>

          {revenueTrend.some((p) => p.revenue > 0) ? (
            <div className="flex items-end gap-1.5 h-40 pt-4">
              {revenueTrend.map((p) => (
                <div key={p.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div
                    className="w-full bg-indigo-600 rounded-t-md hover:bg-indigo-500 transition-colors"
                    style={{ height: `${Math.max(4, (p.revenue / maxRevenue) * 100)}%` }}
                    title={`${p.date}: $${p.revenue.toFixed(2)}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 italic">
              No paid orders recorded in the last 14 days.
            </div>
          )}

          <div className="flex justify-between text-xs font-mono text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span>{revenueTrend[0]?.date}</span>
            <span>{revenueTrend[revenueTrend.length - 1]?.date}</span>
          </div>
        </div>

        {/* Top Selling Products Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h2 className="font-extrabold text-base mb-4 text-slate-900 dark:text-white">Top Selling Products</h2>
          {topSelling.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topSelling.map((p) => (
                <div key={p.productId} className="flex justify-between items-center py-3 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{p.name}</span>
                  <span className="text-slate-500 font-mono font-semibold">
                    {p.quantitySold} sold · <span className="text-emerald-600 dark:text-emerald-400 font-bold">${p.revenue.toFixed(2)}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 italic">
              No sales data recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
