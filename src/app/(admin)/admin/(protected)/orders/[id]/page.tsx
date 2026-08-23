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

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { getGeneralSettings } from "@/lib/firebase/repositories/site-settings";

export const dynamic = "force-dynamic";

function formatHours(hours: number | null): string {
  if (hours === null) return "—";
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, activity, documents, general] = await Promise.all([
    getOrderById(params.id),
    getRecentOrderActivity(params.id),
    getOrderDocumentHistory(params.id),
    getGeneralSettings(),
  ]);
  if (!order) notFound();

  return (
    <>
      {/* SCREEN UI (Hidden when printing!) */}
      <div className="w-full space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group"
              >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to All Orders</span>
              </Link>
              <span className="text-xs font-mono font-bold text-slate-400">/</span>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                #{order.orderNumber}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-2">
              Order {order.orderNumber}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              Placed {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recently"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Left Column (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Items Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-4 flex items-center justify-between">
                <span>Order Items ({order.items.length})</span>
                <span className="text-xs font-mono text-slate-400">Subtotal: ${order.subtotal.toFixed(2)}</span>
              </h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-3.5 text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.name}</p>
                      <p className="text-slate-500 font-mono mt-0.5">
                        Qty: <span className="font-bold text-slate-700 dark:text-slate-300">{item.quantity}</span> · ${item.unitPrice.toFixed(2)} each
                      </p>
                    </div>
                    <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm font-mono">${item.lineTotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Items Subtotal</span>
                  <span className="font-mono font-semibold">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Shipping Cost</span>
                  <span className="font-mono font-semibold">${order.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-slate-100 font-extrabold text-sm border-t border-slate-200 dark:border-slate-800 pt-3">
                  <span>Total Amount</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-3">Shipping &amp; Delivery Address</h2>
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{order.shippingAddress.fullName}</p>
                <p className="font-mono text-slate-600 dark:text-slate-400">📞 {order.shippingAddress.phone}</p>
                <p className="mt-1 font-medium">
                  {order.shippingAddress.line1}
                  {order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}
                </p>
                <p className="font-medium">
                  {order.shippingAddress.city}
                  {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="font-bold text-indigo-600 dark:text-indigo-400">{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Status History Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-4">Status History Timeline</h2>
              <div className="space-y-3 text-xs">
                {order.statusHistory?.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="capitalize font-bold text-slate-900 dark:text-slate-100">{h.status}</span>
                    <span className="text-slate-500 font-mono" suppressHydrationWarning>
                      {new Date(h.at).toLocaleString()}
                    </span>
                  </div>
                ))}
                {!order.statusHistory?.length && (
                  <p className="text-slate-500 text-xs italic">No status changes recorded yet.</p>
                )}
              </div>
            </div>

            <OrderLifecycleActions order={order} activity={activity} documents={documents} />
          </div>

          {/* Right Sidebar Column (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Manage Order Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs h-fit">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Manage Order</h2>
                <span className="text-xs font-mono font-bold uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  {order.paymentMethod.replace("_", " ")}
                </span>
              </div>
              <OrderActions order={order} />
            </div>

            {/* Order Analytics Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs h-fit">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-4">Order Performance Analytics</h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Order Age</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatHours(getOrderAgeHours(order))}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Fulfillment Duration</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatHours(getFulfillmentDurationHours(order))}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-500 font-medium">Delivery Duration</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatHours(getDeliveryDurationHours(order))}</span>
                </div>
                {isOrderStale(order) && (
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 mt-2">
                    ⚠️ Order status has not been updated in over 48 hours.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED PRINT-ONLY COMMERCIAL INVOICE RECEIPT */}
      <div className="hidden print:block p-8 bg-white text-slate-900 font-sans max-w-2xl mx-auto border border-slate-300 rounded-xl">
        <div className="flex justify-between items-start border-b border-slate-300 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">{general.storeName || "Store Invoice"}</h1>
            <p className="text-xs text-slate-600 mt-1">{general.storeEmail || ""} {general.storePhone ? `· ${general.storePhone}` : ""}</p>
          </div>
          <div className="text-right">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border border-slate-900 px-3 py-1 rounded-full">
              ORDER INVOICE
            </span>
            <h2 className="text-lg font-mono font-extrabold text-slate-900 mt-2">#{order.orderNumber}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-200 text-xs">
          <div>
            <h3 className="font-bold uppercase tracking-wider text-slate-500 mb-1">Customer Details:</h3>
            <p className="font-extrabold text-sm text-slate-900">{order.shippingAddress?.fullName || order.guestName || "Valued Customer"}</p>
            <p className="text-slate-700 font-mono mt-0.5">📞 {order.shippingAddress?.phone}</p>
            <p className="text-slate-600 mt-1">
              {[order.shippingAddress?.line1, order.shippingAddress?.line2, order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode, order.shippingAddress?.country].filter(Boolean).join(", ")}
            </p>
          </div>
          <div className="text-right">
            <h3 className="font-bold uppercase tracking-wider text-slate-500 mb-1">Shipping &amp; Payment:</h3>
            <p className="text-slate-700"><span className="font-bold">Payment Method:</span> {order.paymentMethod.toUpperCase()}</p>
            <p className="text-slate-700"><span className="font-bold">Payment Status:</span> {order.paymentStatus.toUpperCase()}</p>
            {order.trackingNumber && (
              <p className="text-slate-900 font-mono font-bold mt-1.5 bg-slate-100 p-1.5 rounded-lg inline-block">
                Tracking ID: {order.trackingNumber}
              </p>
            )}
          </div>
        </div>

        <table className="w-full text-xs text-left mb-6 border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700 font-mono uppercase">
              <th className="py-2.5 px-3">Item Description</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-2.5 px-3 font-semibold text-slate-800">{item.name}</td>
                <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                <td className="py-2.5 px-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold">${item.lineTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end text-xs mb-8">
          <div className="w-60 space-y-1.5 border-t border-slate-300 pt-3">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee:</span>
              <span className="font-mono">${order.shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t-2 border-slate-900 pt-2">
              <span>Total Amount:</span>
              <span className="font-mono">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500">
          <p className="font-bold text-slate-700">Thank you for shopping with {general.storeName || "our store"}!</p>
          <p className="mt-0.5">This is an official computer-generated receipt for your order.</p>
        </div>
      </div>
    </>
  );
}
