import React from "react";
import Link from "next/link";
import { getCustomers, getGuestCustomers } from "@/lib/firebase/repositories/customers";

export const dynamic = "force-dynamic";

const STATUS_BADGE_CLASS: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  blocked: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  deleted: "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  guest: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default async function AdminCustomersPage() {
  const [customers, guests] = await Promise.all([getCustomers(), getGuestCustomers()]);

  const rows = [
    ...customers.map((c) => ({
      id: c.uid,
      displayName: c.displayName,
      email: c.email,
      orderCount: c.orderCount ?? 0,
      totalSpend: c.totalSpend ?? 0,
      createdAt: c.createdAt,
      status: c.status ?? "active",
    })),
    ...guests.map((g) => ({
      id: g.uid,
      displayName: g.displayName,
      email: g.email,
      orderCount: g.orderCount,
      totalSpend: g.totalSpend,
      createdAt: g.createdAt,
      status: "guest" as const,
    })),
  ].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customers ({rows.length})</h1>
        <Link
          href={"/admin/customers/export" as any}
          className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
        >
          Export
        </Link>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Total spend</th>
              <th className="p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 dark:border-neutral-800/60">
                <td className="p-4">
                  <Link href={`/admin/customers/${r.id}` as any} className="font-medium hover:underline">
                    {r.displayName || "—"}
                  </Link>
                </td>
                <td className="p-4 text-neutral-500">{r.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE_CLASS[r.status]}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-4">{r.orderCount}</td>
                <td className="p-4">${r.totalSpend.toFixed(2)}</td>
                <td className="p-4 text-neutral-500">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  No customers yet. Registered accounts and guest checkouts will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
