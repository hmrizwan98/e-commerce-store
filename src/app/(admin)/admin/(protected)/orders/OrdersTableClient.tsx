"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { EyeIcon } from "@heroicons/react/24/outline";
import type { Order } from "@/types/order";

interface OrdersTableClientProps {
  orders: Order[];
}

function renderStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending
        </span>
      );
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Confirmed
        </span>
      );
    case "processing":
    case "packed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          {status === "processing" ? "Processing" : "Packed"}
        </span>
      );
    case "shipped":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          Shipped
        </span>
      );
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Delivered
        </span>
      );
    case "cancelled":
    case "refunded":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {status}
        </span>
      );
  }
}

export default function OrdersTableClient({ orders }: OrdersTableClientProps) {
  const [viewedIds, setViewedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin_viewed_order_ids");
      if (raw) {
        setViewedIds(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const handleMarkViewed = (orderId: string) => {
    try {
      const raw = localStorage.getItem("admin_viewed_order_ids");
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(orderId)) {
        list.push(orderId);
        localStorage.setItem("admin_viewed_order_ids", JSON.stringify(list));
        setViewedIds(list);
      }
    } catch {}
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-6 py-4">Order #</th>
              <th className="px-6 py-4">Customer &amp; Contact</th>
              <th className="px-6 py-4">Date &amp; Time</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4">Order Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {orders.map((o) => {
              const customerName =
                o.shippingAddress?.fullName || o.guestName || o.guestEmail || o.userId || "Guest Customer";
              const customerPhone = o.shippingAddress?.phone || "";
              const orderDate = o.createdAt
                ? new Date(o.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";

              const isUnread = !viewedIds.includes(o.id);

              return (
                <tr
                  key={o.id}
                  className={`transition-all hover:bg-slate-50/90 dark:hover:bg-slate-800/50 ${
                    isUnread
                      ? "bg-amber-50/40 dark:bg-amber-950/20 border-l-4 border-l-amber-500"
                      : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/orders/${o.id}` as any}
                        onClick={() => handleMarkViewed(o.id)}
                        className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                      >
                        <span>{o.orderNumber}</span>
                      </Link>

                      {isUnread && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-rose-500 text-white shadow-xs animate-pulse">
                          ⚡ UNREAD
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{customerName}</span>
                      {isUnread && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-xs">
                          New
                        </span>
                      )}
                    </div>
                    {customerPhone && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        📞 {customerPhone}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-medium">
                    {orderDate}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    ${o.total.toFixed(2)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 capitalize">
                      {o.paymentMethod.replace("_", " ")} ·{" "}
                      <span
                        className={
                          o.paymentStatus === "paid"
                            ? "text-emerald-600 font-bold"
                            : "text-slate-500"
                        }
                      >
                        {o.paymentStatus.replace("_", " ")}
                      </span>
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(o.orderStatus)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      href={`/admin/orders/${o.id}` as any}
                      onClick={() => handleMarkViewed(o.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                        isUnread
                          ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20 hover:bg-amber-600"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white"
                      }`}
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                      <span>{isUnread ? "View New Order" : "View Details"}</span>
                    </Link>
                  </td>
                </tr>
              );
            })}

            {!orders.length && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto text-xl">
                      🛒
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No Orders Found
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Orders will automatically show up here as soon as customers place their orders.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
