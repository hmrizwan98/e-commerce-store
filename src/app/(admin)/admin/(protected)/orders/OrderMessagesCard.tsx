"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { getPaymentProofLinkAction } from "./payment-proof-actions";
import type { DeliveryRecord, DeliveryStatus, Order } from "@/types/order";

const TONE: Record<DeliveryStatus, string> = {
  sent: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  pending: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
  failed: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  not_configured: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  no_recipient: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700",
  disabled: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700",
};
const LABEL: Record<DeliveryStatus, string> = {
  sent: "Sent",
  pending: "Pending",
  failed: "Failed",
  not_configured: "Not configured",
  no_recipient: "No recipient",
  disabled: "Turned off",
};

function Row({ title, record }: { title: string; record?: DeliveryRecord }) {
  return (
    <div className="py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{title}</span>
        {record ? (
          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${TONE[record.status]}`}>{LABEL[record.status]}</span>
        ) : (
          <span className="text-[11px] text-slate-400">Not recorded</span>
        )}
      </div>
      <p className="text-[11px] text-slate-500 mt-1">
        {record ? record.message : "This order was placed before delivery tracking was added."}
      </p>
    </div>
  );
}

/** Real outcome of the automatic customer messages + the customer's payment screenshots. */
export default function OrderMessagesCard({ order }: { order: Order }) {
  const [opening, setOpening] = useState<number | null>(null);
  const proofs = order.paymentProofs ?? [];
  const isPrepaid = order.paymentMethod !== "cod";

  const view = async (index: number) => {
    setOpening(index);
    // Opened synchronously so popup blockers allow it; filled once the signed link arrives.
    const win = window.open("about:blank", "_blank");
    try {
      const res = await getPaymentProofLinkAction(order.id, index);
      if (res.ok && win) win.location.href = res.url;
      else {
        win?.close();
        toast.error(res.ok ? "Allow pop-ups to view the screenshot." : res.error);
      }
    } catch {
      win?.close();
      toast.error("Could not open the screenshot.");
    } finally {
      setOpening(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs h-fit space-y-4">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-2">Customer Messages</h2>
        <Row title="Order confirmation email" record={order.notificationDelivery?.confirmationEmail} />
        <Row title="Automatic WhatsApp message" record={order.notificationDelivery?.confirmationWhatsApp} />
      </div>

      {isPrepaid && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-1">Payment Proof</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Transaction reference:{" "}
            <span className="font-mono font-bold">{order.paymentTransactionRef || "—"}</span>
          </p>
          {proofs.length === 0 ? (
            <p className="text-[11px] text-slate-500 mt-2">No screenshot uploaded yet. Customers can upload one from the order confirmation or order tracking page.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {proofs.map((p, i) => (
                <li key={p.publicId} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-600 dark:text-slate-300" suppressHydrationWarning>
                    Screenshot {i + 1} · {new Date(p.uploadedAt).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => void view(i)}
                    disabled={opening !== null}
                    className="font-bold text-primary-600 hover:underline disabled:opacity-50"
                  >
                    {opening === i ? "Opening…" : "View"}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-slate-400 mt-2">Screenshots are private - each View link works for 10 minutes. Check the money in your account before marking the order Paid.</p>
        </div>
      )}
    </div>
  );
}
