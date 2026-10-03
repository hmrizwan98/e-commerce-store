import React from "react";
import Link from "next/link";
import {
  ArchiveBoxIcon,
  CheckBadgeIcon,
  CheckIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  HomeIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { headers } from "next/headers";
import Label from "@/components/Label/Label";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { getOrderByOrderNumber } from "@/lib/firebase/repositories/orders";
import { getShippingSettings, getGeneralSettings } from "@/lib/firebase/repositories/site-settings";
import { formatMoney } from "@/lib/currency/format";
import { normalizePhone } from "@/lib/orders/verification/phone";
import { checkRateLimit } from "@/lib/firebase/rate-limit";
import { getCurrentTenant } from "@/lib/tenant/current";
import type { Order, OrderStatus } from "@/types/order";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const STEP_ICONS: Record<string, typeof TruckIcon> = {
  pending: ClipboardDocumentListIcon,
  confirmed: CheckBadgeIcon,
  processing: Cog6ToothIcon,
  packed: ArchiveBoxIcon,
  shipped: TruckIcon,
  delivered: HomeIcon,
};

const ORDER_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
];

function resolveCourierUrl(courierName?: string, trackingNumber?: string, customUrl?: string): string | null {
  if (customUrl) return customUrl;
  const name = (courierName || "").toLowerCase().trim();
  if (name.includes("couriers next") || name.includes("couriersnext") || name.includes("courier next")) {
    return "https://portal.couriersnext.com/tracking.php";
  }
  if (name.includes("tcs") && trackingNumber) {
    return `https://www.tcsexpress.com/tracking?trackingNo=${trackingNumber}`;
  }
  if (name.includes("postex") && trackingNumber) {
    return `https://postex.pk/tracking?trackingNo=${trackingNumber}`;
  }
  if (name.includes("trax") && trackingNumber) {
    return `https://trax.pk/tracking?trackingNo=${trackingNumber}`;
  }
  if (name.includes("leopard") && trackingNumber) {
    return `https://www.leopardscourier.com/tracking?track=${trackingNumber}`;
  }
  if ((name.includes("callcourier") || name.includes("call courier")) && trackingNumber) {
    return `https://callcourier.com.pk/tracking/?tc=${trackingNumber}`;
  }
  return null;
}

/** Order number + the email OR phone given at checkout. Phones are compared after
 * normalization (0300-1234567 == +92 300 1234567); unparseable numbers fall back to a
 * digits-only comparison, and need at least 7 digits so a short guess can't match. */
function orderMatchesContact(order: Order, contact: string): boolean {
  if (contact.includes("@")) {
    return !!order.guestEmail && order.guestEmail.trim().toLowerCase() === contact.toLowerCase();
  }
  const orderPhone = order.shippingAddress?.phone ?? "";
  const a = normalizePhone(contact);
  const b = normalizePhone(orderPhone);
  if (a.isValid && b.isValid) return a.digits === b.digits;
  const digitsA = contact.replace(/\D/g, "");
  return digitsA.length >= 7 && digitsA === orderPhone.replace(/\D/g, "");
}

const OrderTrackingPage = async ({
  searchParams,
}: {
  searchParams: { orderNumber?: string; contact?: string; email?: string };
}) => {
  const [shippingSettings, general] = await Promise.all([getShippingSettings(), getGeneralSettings()]);
  const isTrackingEnabled = shippingSettings.trackingEnabled ?? true;

  const orderNumber = searchParams.orderNumber?.trim();
  // One "email or phone" field - checkout's email is optional, so a customer who only gave
  // a phone number must still be able to track. `email` is the older param name, kept so
  // existing links (thank-you page, WhatsApp messages) keep working.
  const contact = (searchParams.contact ?? searchParams.email)?.trim();
  const searched = Boolean(orderNumber && contact);

  let isRateLimited = false;
  let order: Order | null = null;

  if (isTrackingEnabled && searched && orderNumber && contact) {
    const reqHeaders = headers();
    const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || reqHeaders.get("x-real-ip") || "anonymous";
    const tenant = await getCurrentTenant();
    const rateLimitKey = `${tenant?.id || "default"}:${ip}`;
    const rateCheck = await checkRateLimit("tracking", rateLimitKey);

    if (!rateCheck.allowed) {
      isRateLimited = true;
    } else {
      order = await getOrderByOrderNumber(orderNumber);
    }
  }

  const matched = order && contact && orderMatchesContact(order, contact) ? order : null;

  // Calculate current step index for visual timeline
  const currentStepIndex = matched
    ? ORDER_STEPS.indexOf(matched.orderStatus)
    : -1;

  if (!isTrackingEnabled) {
    return (
      <div className="container py-20 max-w-xl text-center">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-amber-200/60 dark:border-amber-800/60">
          📦
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
          Order Tracking Disabled
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          Order tracking is currently turned off by the store administrator. Please contact store support directly for updates regarding your order.
        </p>
        <Link
          href="/collection"
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-2xl bg-primary-600 hover:bg-primary-700 text-white transition-all shadow-md hover:shadow-lg"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12 lg:pb-24 lg:pt-16 max-w-3xl">
      <div className="mb-10 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200/60 dark:border-primary-800/60 text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-wider mb-3">
          🚚 Real-Time Shipment Status
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Track Your Order
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Enter your order number and the email or phone number used at checkout.
        </p>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 mb-10">
        <form method="get" className="grid sm:grid-cols-5 gap-4 items-end">
          <div className="sm:col-span-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Number</Label>
            <Input
              className="mt-1.5 font-mono uppercase"
              name="orderNumber"
              defaultValue={orderNumber}
              placeholder="ORD-XXXXXXXX"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email or Phone Number</Label>
            <Input
              className="mt-1.5"
              type="text"
              name="contact"
              defaultValue={contact}
              placeholder="you@example.com or 0300 1234567"
              autoComplete="email tel"
              required
            />
          </div>
          <div className="sm:col-span-1">
            <ButtonPrimary type="submit" className="w-full">
              Track
            </ButtonPrimary>
          </div>
        </form>

        {searched && isRateLimited && (
          <p className="mt-4 text-xs text-rose-600 dark:text-rose-400 font-semibold text-center">
            ⚠️ Too many tracking attempts. Please wait a few minutes and try again.
          </p>
        )}

        {searched && !isRateLimited && !matched && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 font-medium text-center">
            No order found matching order number <span className="font-mono font-bold">{orderNumber}</span> and <span className="font-bold">{contact}</span>.
          </div>
        )}
      </div>

      {matched && (
        <div className="space-y-8">
          {/* Order Header Summary */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">Order Ref</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {matched.orderNumber}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Placed on {matched.createdAt ? new Date(matched.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>

              <div className="text-right">
                <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Current Status</span>
                <div className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {STATUS_LABELS[matched.orderStatus] ?? matched.orderStatus}
                </div>
              </div>
            </div>

            {/* Visual Step Timeline - fills up to the current step on load, steps pop in one by
                one, and the current step pulses (animations defined in globals.css, disabled
                under prefers-reduced-motion). Colors follow the store's theme primary. */}
            {currentStepIndex !== -1 && (
              <div className="pt-10 pb-4">
                <div className="relative max-w-2xl mx-auto">
                  <div className="absolute top-4 sm:top-5 left-[8.33%] right-[8.33%] h-1 rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div
                    className="track-fill absolute top-4 sm:top-5 left-[8.33%] h-1 rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                    style={{ width: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 83.34}%` }}
                  />
                  <ol className="relative grid grid-cols-6">
                    {ORDER_STEPS.map((step, idx) => {
                      const isPassed = idx < currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      const Icon = STEP_ICONS[step];
                      return (
                        <li
                          key={step}
                          className="step-pop flex flex-col items-center text-center"
                          style={{ animationDelay: `${idx * 110}ms` }}
                        >
                          <div className="relative">
                            {isCurrent && (
                              <span className="absolute inset-0 rounded-full bg-primary-500/40 animate-ping" aria-hidden />
                            )}
                            <div
                              className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                                isCurrent
                                  ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30 ring-4 ring-primary-100 dark:ring-primary-900/60"
                                  : isPassed
                                  ? "bg-primary-600 text-white"
                                  : "bg-white dark:bg-slate-900 text-slate-400 border-2 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              {isPassed ? <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </div>
                          </div>
                          <span
                            className={`text-[9px] sm:text-xs font-bold mt-2 sm:mt-3 leading-tight px-0.5 ${
                              isCurrent
                                ? "text-primary-600 dark:text-primary-400"
                                : isPassed
                                ? "text-slate-800 dark:text-slate-200"
                                : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {STATUS_LABELS[step]}
                          </span>
                          {isCurrent && (
                            <span className="mt-1 text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-primary-500">Current</span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            )}

            {/* Courier / Delivery Information Card */}
            {(matched.trackingNumber || matched.courierName || matched.dispatchDate) && (
              <div className="mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🚚</span>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivery Provider</h3>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        {matched.courierName || shippingSettings.defaultCourierName || "Standard Delivery Service"}
                        {matched.trackingMode === "in_house" && " (In-House Rider)"}
                      </p>
                    </div>
                  </div>

                  {matched.trackingNumber && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Tracking / Consignment #</h3>
                      <p className="text-sm font-mono font-extrabold text-primary-600 dark:text-primary-400 select-all">
                        {matched.trackingNumber}
                      </p>
                    </div>
                  )}
                </div>

                {matched.dispatchDate && (
                  <p className="text-xs text-slate-500 border-t border-slate-200/60 dark:border-slate-700/60 pt-2.5">
                    Dispatched on: <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date(matched.dispatchDate).toLocaleDateString()}</span>
                    {matched.deliveryDate && (
                      <span className="ml-3">
                        Est. Delivery: <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date(matched.deliveryDate).toLocaleDateString()}</span>
                      </span>
                    )}
                  </p>
                )}

                {(() => {
                  const courierUrl = resolveCourierUrl(
                    matched.courierName || shippingSettings.defaultCourierName,
                    matched.trackingNumber,
                    matched.trackingUrl
                  );
                  if (!courierUrl) return null;
                  return (
                    <div className="pt-2 flex flex-wrap gap-2 items-center">
                      <a
                        href={courierUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        🔗 Track Live on {matched.courierName || "Courier Portal"} ↗
                      </a>
                      {matched.trackingNumber && (
                        <span className="text-[11px] text-slate-500">
                          (Consignment #: <code className="font-mono font-bold text-slate-800 dark:text-slate-200 select-all">{matched.trackingNumber}</code>)
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Items & Shipping Address Breakdown */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl shadow-slate-900/5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Ordered Items</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {matched.items.map((item) => (
                  <div key={`${item.productId}-${item.variantId ?? ""}`} className="py-3 flex justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</span>
                      <span className="text-xs text-slate-400 block">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatMoney(item.lineTotal, general)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatMoney(matched.subtotal, general)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono">{formatMoney(matched.shippingCost, general)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Total Paid / COD</span>
                  <span className="font-mono">{formatMoney(matched.total, general)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl shadow-slate-900/5 space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Shipping Address</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {matched.shippingAddress.fullName}
                  <br />
                  {matched.shippingAddress.line1}
                  {matched.shippingAddress.line2 ? `, ${matched.shippingAddress.line2}` : ""}
                  <br />
                  {matched.shippingAddress.city}
                  {matched.shippingAddress.state ? `, ${matched.shippingAddress.state}` : ""}{" "}
                  {matched.shippingAddress.postalCode}
                  <br />
                  {matched.shippingAddress.country}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Activity Log</h3>
                <ul className="text-xs text-slate-500 space-y-2 max-h-48 overflow-y-auto pr-2">
                  {matched.statusHistory.map((h, i) => (
                    <li key={i} className="flex justify-between gap-2 py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-none">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{STATUS_LABELS[h.status] ?? h.status}</span>
                      <span className="text-slate-400" suppressHydrationWarning>{new Date(h.at).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/collection"
          className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline"
        >
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
