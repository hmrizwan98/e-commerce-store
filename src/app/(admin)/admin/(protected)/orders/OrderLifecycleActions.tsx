"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  setShipmentDetails,
  addInternalNote,
  addCustomerNote,
  cancelOrder,
  initiateRefund,
  updateReturnStatus,
  requestOrderDocument,
} from "./actions";
import { buildOrderTimeline } from "@/lib/orders/order-timeline";
import type { Order, ReturnStatus } from "@/types/order";
import type { OrderActivityLog } from "@/types/order-activity-log";
import type { OrderDocument, OrderDocumentType } from "@/types/order-document";

const RETURN_STATUSES: ReturnStatus[] = ["requested", "approved", "rejected", "received", "completed"];
const DOCUMENT_TYPES: { type: OrderDocumentType; label: string }[] = [
  { type: "invoice", label: "Queue invoice" },
  { type: "packing_slip", label: "Queue packing slip" },
  { type: "shipping_label", label: "Queue shipping label" },
];

const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6";
const inputClass =
  "px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";

function toDateInputValue(ms?: number): string {
  return ms ? new Date(ms).toISOString().slice(0, 10) : "";
}

const OrderLifecycleActions: React.FC<{
  order: Order;
  activity: OrderActivityLog[];
  documents: OrderDocument[];
}> = ({ order, activity, documents }) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [courierName, setCourierName] = useState(order.courierName ?? "");
  const [dispatchDate, setDispatchDate] = useState(toDateInputValue(order.dispatchDate));
  const [deliveryDate, setDeliveryDate] = useState(toDateInputValue(order.deliveryDate));
  const [internalNoteText, setInternalNoteText] = useState("");
  const [customerNoteText, setCustomerNoteText] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [refundAmount, setRefundAmount] = useState(String(order.total));
  const [refundReason, setRefundReason] = useState("");
  const [returnStatus, setReturnStatus] = useState<ReturnStatus>(order.returnStatus ?? "requested");
  const [returnNote, setReturnNote] = useState("");

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const timeline = buildOrderTimeline(order, activity);
  const isCancellable = order.orderStatus !== "cancelled" && order.orderStatus !== "delivered";

  return (
    <>
      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Order timeline</h2>
        <div className="space-y-2 text-sm">
          {timeline.map((e, i) => (
            <div key={i} className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>
                {e.label}
                {e.note ? ` — ${e.note}` : ""}
              </span>
              <span>{new Date(e.at).toLocaleString()}</span>
            </div>
          ))}
          {!timeline.length && <p className="text-neutral-500">No activity recorded yet.</p>}
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Payment timeline</h2>
        <div className="space-y-2 text-sm">
          {order.paymentStatusHistory?.map((h, i) => (
            <div key={i} className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span className="capitalize">
                {h.status.replace("_", " ")}
                {h.note ? ` — ${h.note}` : ""}
              </span>
              <span>{new Date(h.at).toLocaleString()}</span>
            </div>
          ))}
          {!order.paymentStatusHistory?.length && (
            <p className="text-neutral-500">No payment changes recorded yet.</p>
          )}
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Shipment information</h2>
        <p className="text-sm text-neutral-500 mb-3">Tracking number: {order.trackingNumber ?? "—"}</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Courier name</label>
            <input
              className={`${inputClass} w-full`}
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Dispatch date</label>
              <input
                type="date"
                className={`${inputClass} w-full`}
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery date</label>
              <input
                type="date"
                className={`${inputClass} w-full`}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
          </div>
          <button
            disabled={busy}
            onClick={() =>
              run(() =>
                setShipmentDetails(order.id, {
                  courierName: courierName || undefined,
                  dispatchDate: dispatchDate ? new Date(dispatchDate).getTime() : undefined,
                  deliveryDate: deliveryDate ? new Date(deliveryDate).getTime() : undefined,
                })
              )
            }
            className="px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700"
          >
            Save shipment info
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Notes</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Internal notes</p>
            <div className="space-y-2 mb-3 text-sm max-h-40 overflow-y-auto">
              {order.internalNotes
                ?.slice()
                .reverse()
                .map((n, i) => (
                  <div key={i} className="text-neutral-600 dark:text-neutral-400">
                    <p>{n.text}</p>
                    <p className="text-xs text-neutral-400">{new Date(n.at).toLocaleString()}</p>
                  </div>
                ))}
              {!order.internalNotes?.length && <p className="text-neutral-500">No internal notes yet.</p>}
            </div>
            <textarea
              className={`${inputClass} w-full`}
              rows={2}
              value={internalNoteText}
              onChange={(e) => setInternalNoteText(e.target.value)}
              placeholder="Add an internal note…"
            />
            <button
              disabled={busy || !internalNoteText.trim()}
              onClick={() =>
                run(async () => {
                  await addInternalNote(order.id, internalNoteText);
                  setInternalNoteText("");
                })
              }
              className="mt-2 px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700"
            >
              Add internal note
            </button>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Customer notes</p>
            <div className="space-y-2 mb-3 text-sm max-h-40 overflow-y-auto">
              {order.customerNotes
                ?.slice()
                .reverse()
                .map((n, i) => (
                  <div key={i} className="text-neutral-600 dark:text-neutral-400">
                    <p>{n.text}</p>
                    <p className="text-xs text-neutral-400">{new Date(n.at).toLocaleString()}</p>
                  </div>
                ))}
              {!order.customerNotes?.length && <p className="text-neutral-500">No customer notes yet.</p>}
            </div>
            <textarea
              className={`${inputClass} w-full`}
              rows={2}
              value={customerNoteText}
              onChange={(e) => setCustomerNoteText(e.target.value)}
              placeholder="Add a customer-facing note…"
            />
            <button
              disabled={busy || !customerNoteText.trim()}
              onClick={() =>
                run(async () => {
                  await addCustomerNote(order.id, customerNoteText);
                  setCustomerNoteText("");
                })
              }
              className="mt-2 px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700"
            >
              Add customer note
            </button>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Cancellation / Refund / Return</h2>
        <p className="text-xs text-neutral-500 mb-4">
          Cancelling or refunding does not automatically restore stock — adjust the Inventory page
          manually if needed.
        </p>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-2">Cancel order</p>
            <div className="flex gap-2">
              <input
                className={`${inputClass} flex-1`}
                placeholder="Cancellation reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <button
                disabled={busy || !isCancellable || !cancelReason.trim()}
                onClick={() =>
                  run(async () => {
                    await cancelOrder(order.id, cancelReason);
                    setCancelReason("");
                  })
                }
                className="px-4 py-2 text-sm rounded-lg border border-red-300 text-red-600 dark:border-red-800"
              >
                Cancel order
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Issue refund</p>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                className={`${inputClass} w-28`}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
              <input
                className={`${inputClass} flex-1`}
                placeholder="Refund reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
              <button
                disabled={busy || !refundReason.trim() || !(Number(refundAmount) > 0)}
                onClick={() =>
                  run(async () => {
                    await initiateRefund(order.id, Number(refundAmount), refundReason);
                    setRefundReason("");
                  })
                }
                className="px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700"
              >
                Refund
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Return status</p>
            <div className="flex gap-2">
              <select
                className={inputClass}
                value={returnStatus}
                onChange={(e) => setReturnStatus(e.target.value as ReturnStatus)}
              >
                {RETURN_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                className={`${inputClass} flex-1`}
                placeholder="Note (optional)"
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
              />
              <button
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await updateReturnStatus(order.id, returnStatus, returnNote || undefined);
                    setReturnNote("");
                  })
                }
                className="px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700"
              >
                Update return
              </button>
            </div>
            {order.returnStatus && (
              <p className="text-xs text-neutral-500 mt-2">
                Current return status: <span className="capitalize">{order.returnStatus}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Documents</h2>
        <p className="text-xs text-neutral-500 mb-4">
          Architecture only — queues a record for a future document-generation phase; no PDF is
          produced yet.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {DOCUMENT_TYPES.map(({ type, label }) => (
            <button
              key={type}
              disabled={busy}
              onClick={() => run(() => requestOrderDocument(order.id, type))}
              className="px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="space-y-2 text-sm">
          {documents.map((d) => (
            <div key={d.id} className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span className="capitalize">
                {d.type.replace("_", " ")} — {d.status}
              </span>
              <span>{d.createdAt ? new Date(d.createdAt).toLocaleString() : "—"}</span>
            </div>
          ))}
          {!documents.length && <p className="text-neutral-500">No documents queued yet.</p>}
        </div>
      </div>
    </>
  );
};

export default OrderLifecycleActions;
