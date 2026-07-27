import React from "react";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/firebase/repositories/orders";
import OrderActions from "../OrderActions";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id);
  if (!order) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-semibold">Order {order.orderNumber}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Items</h2>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-neutral-500">
                      Qty {item.quantity} · ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium">${item.lineTotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Shipping address</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}
              <br />
              {order.shippingAddress.city}
              {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{" "}
              {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
              <br />
              {order.shippingAddress.phone}
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Status history</h2>
            <div className="space-y-2 text-sm">
              {order.statusHistory?.map((h, i) => (
                <div key={i} className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span className="capitalize">{h.status}</span>
                  <span>{new Date(h.at).toLocaleString()}</span>
                </div>
              ))}
              {!order.statusHistory?.length && (
                <p className="text-neutral-500">No status changes recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 h-fit">
          <h2 className="font-semibold mb-4">Manage order</h2>
          <p className="text-sm text-neutral-500 mb-4 capitalize">
            Payment method: {order.paymentMethod.replace("_", " ")}
          </p>
          <OrderActions order={order} />
        </div>
      </div>
    </div>
  );
}
