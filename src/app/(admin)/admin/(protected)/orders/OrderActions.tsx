"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus, updatePaymentStatus, setTrackingNumber } from "./actions";
import type { Order, OrderStatus, PaymentStatus } from "@/types/order";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "proof_submitted", "paid", "failed", "refunded"];

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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Order status</label>
        <select
          className={inputClass}
          value={order.orderStatus}
          disabled={busy}
          onChange={(e) => run(() => updateOrderStatus(order.id, e.target.value as OrderStatus))}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Payment status</label>
        <select
          className={inputClass}
          value={order.paymentStatus}
          disabled={busy}
          onChange={(e) => run(() => updatePaymentStatus(order.id, e.target.value as PaymentStatus))}
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tracking number</label>
        <div className="flex gap-2">
          <input
            className={`${inputClass} flex-1`}
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
          <button
            disabled={busy}
            onClick={() => run(() => setTrackingNumber(order.id, tracking))}
            className="px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700"
          >
            Save
          </button>
        </div>
      </div>
      <button
        onClick={() => window.print()}
        className="w-full px-4 py-2.5 text-sm rounded-full border border-neutral-300 dark:border-neutral-700"
      >
        Print invoice
      </button>
    </div>
  );
};

export default OrderActions;
