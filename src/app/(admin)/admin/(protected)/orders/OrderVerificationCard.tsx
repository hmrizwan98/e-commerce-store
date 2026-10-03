"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CustomSelect, { type CustomSelectOption } from "@/components/admin/CustomSelect";
import { useFormatMoney } from "@/lib/currency/CurrencyContext";
import { CONFIRMATION_NOTES, REJECTION_REASONS } from "@/lib/orders/verification/engine";
import { buildVerificationWhatsAppLink, normalizePhone } from "@/lib/orders/verification/phone";
import { approveOrderVerification, rejectOrderVerification, type VerificationActionResult } from "./verification-actions";
import type { Order } from "@/types/order";
import type {
  OrderRejectionReasonCode,
  OrderRiskLevel,
  OrderVerification,
  OrderVerificationRecommendation,
  OrderVerificationStatus,
  VerificationReasonSeverity,
} from "@/types/order-verification";

const RISK_STYLES: Record<OrderRiskLevel, string> = {
  LOW: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  MEDIUM: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  HIGH: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
};

const RECOMMENDATION_LABELS: Record<OrderVerificationRecommendation, string> = {
  RECOMMEND_CONFIRM: "Recommended: confirm order",
  CALL_CUSTOMER: "Recommended: call customer before confirming",
  MANUAL_REVIEW: "Recommended: manual review",
};

const STATUS_LABELS: Record<OrderVerificationStatus, { label: string; className: string }> = {
  pending: { label: "Pending review", className: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" },
  admin_approved: { label: "Approved", className: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400" },
  rejected: { label: "Rejected", className: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400" },
};

const SEVERITY_ICONS: Record<VerificationReasonSeverity, string> = {
  positive: "✅",
  info: "ℹ️",
  warning: "⚠️",
  critical: "⛔",
};

const CONFIRMATION_OPTIONS: CustomSelectOption<string>[] = CONFIRMATION_NOTES.map((n) => ({ value: n.code, label: n.label }));

const REJECTION_OPTIONS: CustomSelectOption<OrderRejectionReasonCode>[] = REJECTION_REASONS.map((r) => ({
  value: r.code,
  label: r.label,
}));

const labelClass = "block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5";
const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";

function formatDateTime(ms?: number): string {
  return ms ? new Date(ms).toLocaleString() : "—";
}

const OrderVerificationCard: React.FC<{
  order: Order;
  verification: OrderVerification;
  storeName: string;
  amountLabel: string;
}> = ({ order, verification, storeName, amountLabel }) => {
  const router = useRouter();
  const formatMoney = useFormatMoney();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"confirm" | "reject" | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [confirmOther, setConfirmOther] = useState("");
  const [rejectCode, setRejectCode] = useState<OrderRejectionReasonCode | "">("");
  const [rejectOther, setRejectOther] = useState("");

  const address = order.shippingAddress;
  const customerName = address?.fullName || order.guestName || "Customer";
  const addressText = [address?.line1, address?.line2, address?.city, address?.state, address?.postalCode]
    .filter(Boolean)
    .join(", ");
  const phone = normalizePhone(address?.phone);
  const waLink = buildVerificationWhatsAppLink({
    phone: address?.phone ?? "",
    customerName,
    storeName,
    orderNumber: order.orderNumber,
    amountLabel,
    address: addressText || "—",
  });
  const h = verification.history;
  const isPending = verification.status === "pending";
  const status = STATUS_LABELS[verification.status];
  // Optional - but "Other" needs its text.
  const confirmBlocked = confirmCode === "other" && confirmOther.trim().length < 3;
  const confirmNote =
    confirmCode === "other" ? confirmOther.trim() : CONFIRMATION_NOTES.find((n) => n.code === confirmCode)?.label ?? "";
  const rejectBlocked = !rejectCode || (rejectCode === "other" && rejectOther.trim().length < 3);

  const run = async (fn: () => Promise<VerificationActionResult>, success: string) => {
    setBusy(true);
    try {
      const result = await fn();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(success);
      setMode(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs h-fit">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Order Verification</h2>
        <span className={`text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-lg ${status.className}`}>{status.label}</span>
      </div>

      <div className="space-y-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1 font-bold rounded-full border ${RISK_STYLES[verification.riskLevel]}`}>
            {verification.riskLevel} RISK
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {RECOMMENDATION_LABELS[verification.recommendation]}
          </span>
        </div>

        <ul className="space-y-1.5">
          {verification.reasons.map((r) => (
            <li key={r.code} className="flex gap-2 text-slate-700 dark:text-slate-300 leading-relaxed">
              <span aria-hidden>{SEVERITY_ICONS[r.severity]}</span>
              <span>{r.message}</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-slate-500">
          Advisory only - based on this store&apos;s own order history. A risk level is not proof of fraud; you make the
          final decision.
        </p>

        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Customer</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-right">{customerName}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Phone</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-right">
              {phone.international || address?.phone || "—"}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500 shrink-0">Address</span>
            <span className="font-medium text-slate-900 dark:text-slate-100 text-right">{addressText || "—"}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">COD amount</span>
            <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400">{amountLabel}</span>
          </div>
        </div>

        <div>
          <p className={labelClass}>Previous orders (this store)</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "Total", value: h.totalOrders },
              { label: "Delivered", value: h.deliveredOrders },
              { label: "Cancelled", value: h.cancelledOrders },
              { label: "RTO", value: h.rtoOrders },
            ].map((s) => (
              <div key={s.label} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="font-mono font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {s.value}
                  {h.truncated && s.label === "Total" ? "+" : ""}
                </p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5" suppressHydrationWarning>
            Last order: {formatDateTime(h.lastOrderAt)}
            {h.averageOrderValue ? ` · Avg delivered order: ${formatMoney(h.averageOrderValue)}` : ""}
          </p>
        </div>

        {(phone.isValid || waLink) && (
          <div className="grid grid-cols-2 gap-2">
            {phone.isValid && (
              <a
                href={`tel:${phone.international}`}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-center"
              >
                📞 Call Customer
              </a>
            )}
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                💬 WhatsApp Customer
              </a>
            )}
          </div>
        )}
        {waLink && isPending && (
          <p className="text-[11px] text-slate-500">
            WhatsApp opens a chat only - replies are not received by Webriiz. Record the customer&apos;s answer below.
          </p>
        )}

        {isPending && mode === null && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              disabled={busy}
              onClick={() => setMode("confirm")}
              className="px-4 py-2.5 text-sm font-extrabold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              Confirm Order
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setMode("reject")}
              className="px-4 py-2.5 text-sm font-bold rounded-xl border border-red-300 text-red-600 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer disabled:opacity-50"
            >
              Reject Order
            </button>
          </div>
        )}

        {isPending && mode === "confirm" && (
          <div className="space-y-2 pt-1">
            <label className={labelClass}>Confirmation note (optional)</label>
            <CustomSelect<string>
              value={confirmCode}
              disabled={busy}
              options={CONFIRMATION_OPTIONS}
              placeholder="Select how it was confirmed"
              onChange={setConfirmCode}
            />
            {confirmCode === "other" && (
              <textarea
                className={inputClass}
                rows={2}
                maxLength={500}
                placeholder="Describe how the order was confirmed"
                value={confirmOther}
                onChange={(e) => setConfirmOther(e.target.value)}
              />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy || confirmBlocked}
                onClick={() => run(() => approveOrderVerification(order.id, confirmNote), "Order verified and confirmed")}
                className="flex-1 px-4 py-2.5 text-sm font-extrabold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? "Confirming..." : "Confirm Order"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setMode(null)}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {isPending && mode === "reject" && (
          <div className="space-y-2 pt-1">
            <label className={labelClass}>Rejection reason (required)</label>
            <CustomSelect<OrderRejectionReasonCode>
              value={rejectCode as OrderRejectionReasonCode}
              disabled={busy}
              options={REJECTION_OPTIONS}
              placeholder="Select a reason"
              onChange={setRejectCode}
            />
            {rejectCode === "other" && (
              <textarea
                className={inputClass}
                rows={2}
                maxLength={500}
                placeholder="Describe the reason"
                value={rejectOther}
                onChange={(e) => setRejectOther(e.target.value)}
              />
            )}
            <p className="text-[11px] text-slate-500">Rejecting cancels the order using the existing cancellation workflow.</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy || rejectBlocked}
                onClick={() =>
                  run(() => rejectOrderVerification(order.id, rejectCode, rejectOther), "Order rejected and cancelled")
                }
                className="flex-1 px-4 py-2.5 text-sm font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? "Rejecting..." : "Reject Order"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setMode(null)}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {verification.decision && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-0.5">
            <p className="font-bold text-slate-900 dark:text-slate-100">
              {verification.decision.decision === "approved" ? "Approved" : "Rejected"} by admin
              {verification.decision.source === "order_status" ? " (via order status)" : ""}
            </p>
            {verification.decision.reason && <p className="text-slate-600 dark:text-slate-400">{verification.decision.reason}</p>}
            <p className="text-[11px] text-slate-500 font-mono" suppressHydrationWarning>
              {formatDateTime(verification.decision.decisionAt)} · {verification.decision.decisionBy.slice(0, 8)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderVerificationCard;
