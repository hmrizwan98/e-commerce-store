import React from "react";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/firebase/repositories/orders";
import { getRecentOrderActivity } from "@/lib/firebase/repositories/order-activity-logs";
import { getOrderDocumentHistory } from "@/lib/firebase/repositories/order-documents";
import {
  getOrderAgeHours,
  getFulfillmentDurationHours,
  getDeliveryDurationHours,
  isOrderStale,
} from "@/lib/orders/order-analytics";
import OrderActions from "../OrderActions";
import OrderLifecycleActions from "../OrderLifecycleActions";

export const dynamic = "force-dynamic";

function formatHours(hours: number | null): string {
  if (hours === null) return "—";
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, activity, documents] = await Promise.all([
    getOrderById(params.id),
    getRecentOrderActivity(params.id),
    getOrderDocumentHistory(params.id),
  ]);
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

          <OrderLifecycleActions order={order} activity={activity} documents={documents} />
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 h-fit">
            <h2 className="font-semibold mb-4">Manage order</h2>
            <p className="text-sm text-neutral-500 mb-4 capitalize">
              Payment method: {order.paymentMethod.replace("_", " ")}
            </p>
            <OrderActions order={order} />
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 h-fit">
            <h2 className="font-semibold mb-4">Order analytics</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Order age</span>
                <span>{formatHours(getOrderAgeHours(order))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Fulfillment time</span>
                <span>{formatHours(getFulfillmentDurationHours(order))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Delivery time</span>
                <span>{formatHours(getDeliveryDurationHours(order))}</span>
              </div>
              {isOrderStale(order) && (
                <p className="text-xs text-amber-600 dark:text-amber-500 pt-1">
                  This order has had no status update in over 48 hours.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
