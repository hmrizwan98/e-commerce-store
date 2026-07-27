import React from "react";
import Link from "next/link";
import { getCustomers } from "@/lib/firebase/repositories/customers";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Customers ({customers.length})</h1>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Total spend</th>
              <th className="p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.uid} className="border-b border-neutral-100 dark:border-neutral-800/60">
                <td className="p-4">
                  <Link href={`/admin/customers/${c.uid}` as any} className="font-medium hover:underline">
                    {c.displayName || "—"}
                  </Link>
                </td>
                <td className="p-4 text-neutral-500">{c.email}</td>
                <td className="p-4">{c.orderCount ?? 0}</td>
                <td className="p-4">${(c.totalSpend ?? 0).toFixed(2)}</td>
                <td className="p-4 text-neutral-500">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {!customers.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  No customers yet. Customers will appear here once storefront sign-up is live.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
