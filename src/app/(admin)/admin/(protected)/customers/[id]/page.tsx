import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomerById, getCustomerAddresses } from "@/lib/firebase/repositories/customers";
import { getOrdersByUserId } from "@/lib/firebase/repositories/orders";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomerById(params.id);
  if (!customer) notFound();

  const [addresses, orders] = await Promise.all([
    getCustomerAddresses(params.id),
    getOrdersByUserId(params.id),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">{customer.displayName || customer.email}</h1>
        <p className="text-sm text-neutral-500">{customer.email}</p>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Addresses</h2>
        {addresses.length ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {addresses.map((a: any) => (
              <div key={a.id} className="text-sm border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                <p className="font-medium">{a.fullName}</p>
                <p className="text-neutral-500">
                  {a.line1}, {a.city} {a.postalCode}
                </p>
                <p className="text-neutral-500">{a.phone}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No saved addresses.</p>
        )}
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Order history</h2>
        {orders.length ? (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {orders.map((o) => (
              <div key={o.id} className="flex justify-between py-3 text-sm">
                <Link href={`/admin/orders/${o.id}` as any} className="font-medium hover:underline">
                  {o.orderNumber}
                </Link>
                <span className="capitalize text-neutral-500">{o.orderStatus}</span>
                <span>${o.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
