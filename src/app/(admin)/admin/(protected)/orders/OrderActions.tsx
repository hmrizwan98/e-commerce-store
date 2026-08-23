"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus, updatePaymentStatus, setTrackingNumber } from "./actions";
import type { Order, OrderStatus, PaymentStatus } from "@/types/order";
import { formatPhoneNumber } from "@/lib/notifications/whatsapp-service";

import CustomSelect, { type CustomSelectOption } from "@/components/admin/CustomSelect";

const ORDER_STATUS_OPTIONS: CustomSelectOption<OrderStatus>[] = [
  { value: "pending", label: "Pending", dot: "bg-amber-500" },
  { value: "confirmed", label: "Confirmed", dot: "bg-blue-500" },
  { value: "processing", label: "Processing", dot: "bg-purple-500" },
  { value: "packed", label: "Packed", dot: "bg-indigo-500" },
  { value: "shipped", label: "Shipped", dot: "bg-cyan-500" },
  { value: "delivered", label: "Delivered", dot: "bg-emerald-500" },
  { value: "cancelled", label: "Cancelled", dot: "bg-rose-500" },
  { value: "refunded", label: "Refunded", dot: "bg-pink-500" },
];

const PAYMENT_STATUS_OPTIONS: CustomSelectOption<PaymentStatus>[] = [
  { value: "unpaid", label: "Unpaid", icon: "⌛" },
  { value: "proof_submitted", label: "Proof Submitted", icon: "📄" },
  { value: "paid", label: "Paid", icon: "✅" },
  { value: "failed", label: "Failed", icon: "❌" },
  { value: "refunded", label: "Refunded", icon: "↩️" },
];

const OrderActions: React.FC<{ order: Order }> = ({ order }) => {
  const router = useRouter();
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";

  const customerPhone = formatPhoneNumber(order.shippingAddress?.phone || "");

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Order Status
        </label>
        <CustomSelect
          value={order.orderStatus}
          disabled={busy}
          options={ORDER_STATUS_OPTIONS}
          onChange={(newStatus) => run(() => updateOrderStatus(order.id, newStatus))}
        />
      </div>

      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Payment Status
        </label>
        <CustomSelect
          value={order.paymentStatus}
          disabled={busy}
          options={PAYMENT_STATUS_OPTIONS}
          onChange={(newStatus) => run(() => updatePaymentStatus(order.id, newStatus))}
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Tracking / Consignment ID
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              className={`${inputClass} flex-1 font-mono font-bold text-slate-900 dark:text-slate-100`}
              placeholder="e.g. TRK-928172"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
            />
            <button
              disabled={busy}
              onClick={() => run(() => setTrackingNumber(order.id, tracking))}
              className="px-4 py-2 text-xs font-extrabold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer shrink-0 shadow-xs"
            >
              Save
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const cleanOrd = order.orderNumber.replace(/^ORD-?/i, "");
              const rnd = Math.floor(1000 + Math.random() * 9000);
              const generated = `TRK-${cleanOrd}-${rnd}`;
              setTracking(generated);
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all border border-indigo-200/60 dark:border-indigo-800/60 cursor-pointer"
          >
            ⚡ Auto-Generate Tracking ID
          </button>
        </div>
        {order.trackingNumber && (
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
            ✓ Active Tracking ID: <span className="font-mono font-bold">{order.trackingNumber}</span>
          </p>
        )}
      </div>
      <button
        onClick={() => window.print()}
        className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        🖨️ Print invoice
      </button>

      {customerPhone && (
        <a
          href={`https://wa.me/${customerPhone}?text=${encodeURIComponent(
            `Hi ${order.guestName || order.shippingAddress?.fullName || "Customer"}, update regarding your Order #${order.orderNumber}: Status is currently "${order.orderStatus.toUpperCase()}".`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-4 py-2.5 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          💬 WhatsApp Customer
        </a>
      )}
    </div>
  );
};

export default OrderActions;
