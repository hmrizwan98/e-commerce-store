import React from "react";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { getInventoryProducts } from "@/lib/firebase/repositories/products";
import { getOrderStats, getTopSellingProducts, getRevenueTrend } from "@/lib/firebase/repositories/orders";
import { getCustomerCount } from "@/lib/firebase/repositories/customers";

export const dynamic = "force-dynamic";

async function countCollection(name: string, filter?: [string, FirebaseFirestore.WhereFilterOp, unknown]) {
  let query: FirebaseFirestore.Query = adminDb().collection(name);
  if (filter) query = query.where(...filter);
  const snap = await query.count().get();
  return snap.data().count;
}

function StatCard({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const content = (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="text-3xl font-semibold mt-2">{value}</p>
    </div>
  );
  return href ? <Link href={href as any}>{content}</Link> : content;
}

export default async function AdminDashboardPage() {
  const [productCount, categoryCount, brandCount, orderStats, customerCount, inventory, topSelling, revenueTrend] =
    await Promise.all([
      countCollection("products", ["isDeleted", "==", false]),
      countCollection("categories", ["isDeleted", "==", false]),
      countCollection("brands", ["isDeleted", "==", false]),
      getOrderStats(),
      getCustomerCount(),
      getInventoryProducts(),
      getTopSellingProducts(5),
      getRevenueTrend(14),
    ]);

  const lowStock = inventory.filter((p) => p.stock <= (p.lowStockThreshold ?? 5)).slice(0, 8);
  const maxRevenue = Math.max(1, ...revenueTrend.map((p) => p.revenue));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue (paid orders)" value={`$${orderStats.totalRevenue.toFixed(2)}`} href="/admin/orders" />
        <StatCard label="Orders" value={orderStats.totalOrders} href="/admin/orders" />
        <StatCard label="Pending orders" value={orderStats.pendingOrders} href="/admin/orders?status=pending" />
        <StatCard label="Customers" value={customerCount} href="/admin/customers" />
        <StatCard label="Products" value={productCount} href="/admin/products" />
        <StatCard label="Categories" value={categoryCount} href="/admin/categories" />
        <StatCard label="Brands" value={brandCount} href="/admin/brands" />
        <StatCard label="Low stock items" value={lowStock.length} href="/admin/inventory" />
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Low stock products</h2>
          <Link href={"/admin/inventory" as any} className="text-sm text-primary-6000 font-medium">
            View all
          </Link>
        </div>
        {lowStock.length ? (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {lowStock.map((p) => (
              <div key={p.id} className="flex justify-between py-2.5 text-sm">
                <Link href={`/admin/products/${p.id}/edit` as any} className="hover:underline">
                  {p.name}
                </Link>
                <span className="text-red-600 font-medium">{p.stock} left</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Nothing is low on stock right now.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Revenue (last 14 days)</h2>
          {revenueTrend.some((p) => p.revenue > 0) ? (
            <div className="flex items-end gap-1.5 h-40">
              {revenueTrend.map((p) => (
                <div key={p.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div
                    className="w-full bg-primary-6000 rounded-t-sm"
                    style={{ height: `${Math.max(2, (p.revenue / maxRevenue) * 100)}%` }}
                    title={`${p.date}: $${p.revenue.toFixed(2)}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No paid orders in this period yet.</p>
          )}
          <div className="flex justify-between text-xs text-neutral-400 mt-2">
            <span>{revenueTrend[0]?.date}</span>
            <span>{revenueTrend[revenueTrend.length - 1]?.date}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Top selling products</h2>
          {topSelling.length ? (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {topSelling.map((p) => (
                <div key={p.productId} className="flex justify-between py-2.5 text-sm">
                  <span>{p.name}</span>
                  <span className="text-neutral-500">
                    {p.quantitySold} sold · ${p.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No sales yet.</p>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-sm text-neutral-500">
        Revenue figures only count orders with <code>paymentStatus: &quot;paid&quot;</code>; top sellers exclude
        cancelled orders.
      </div>
    </div>
  );
}
