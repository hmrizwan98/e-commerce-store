import React from "react";
import Link from "next/link";
import { searchAdminOrders } from "@/lib/firebase/repositories/orders";
import type { OrderStatus } from "@/types/order";

export const dynamic = "force-dynamic";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const { orders, total, totalPages } = await searchAdminOrders({
    status: searchParams.status as OrderStatus | undefined,
    page,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders ({total})</h1>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`px-3 py-1.5 text-sm rounded-full border ${
            !searchParams.status ? "bg-primary-6000 text-white border-primary-6000" : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`px-3 py-1.5 text-sm rounded-full border capitalize ${
              searchParams.status === s
                ? "bg-primary-6000 text-white border-primary-6000"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
              <th className="p-4">Order #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-neutral-100 dark:border-neutral-800/60">
                <td className="p-4">
                  <Link href={`/admin/orders/${o.id}` as any} className="font-medium hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="p-4 text-neutral-500">{o.guestName || o.guestEmail || o.userId || "—"}</td>
                <td className="p-4">${o.total.toFixed(2)}</td>
                <td className="p-4 capitalize">
                  {o.paymentMethod.replace("_", " ")} · {o.paymentStatus.replace("_", " ")}
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 capitalize">
                    {o.orderStatus}
                  </span>
                </td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  No orders yet. Orders will appear here once checkout is live.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?${searchParams.status ? `status=${searchParams.status}&` : ""}page=${p}`}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm ${
                p === page ? "bg-primary-6000 text-white" : "border border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
