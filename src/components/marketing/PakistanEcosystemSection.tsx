import React from "react";
import {
  TruckIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const COURIERS = [
  { name: "Couriers Next", badge: "Live Tracking Portal", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  { name: "TCS Express", badge: "Auto-Consignment Sync", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
  { name: "PostEx", badge: "COD & Merchant Portal", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
  { name: "Trax Logistics", badge: "Nationwide Delivery", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { name: "Leopards Courier", badge: "Overnight Shipping", color: "bg-amber-600/10 text-amber-700 dark:text-amber-300 border-amber-600/20" },
  { name: "CallCourier", badge: "City Express", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
];

const PAYMENTS = [
  { name: "Cash on Delivery (COD)", desc: "Pre-configured COD checkout with automated customer confirmation" },
  { name: "JazzCash", desc: "Direct Account & Mobile Wallet payment instructions at checkout" },
  { name: "EasyPaisa", desc: "EasyPaisa wallet & QR payment steps for fast customer payments" },
  { name: "Bank Transfer", desc: "IBAN & Account details with payment-proof upload support" },
];

function PakistanEcosystemSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 text-white">
      {/* Radial glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-r from-emerald-600/10 via-indigo-600/15 to-cyan-600/10 blur-3xl pointer-events-none -z-10" />

      <div className="container max-w-6xl mx-auto px-4 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            <span className="text-sm">🇵🇰</span>
            <span>Built Specifically for Pakistan eCommerce</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Native integrations with Pakistan&apos;s leading logistics &amp; payments
          </h2>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            No expensive third-party apps needed. Your store comes pre-configured with local Pakistani couriers, WhatsApp order notifications, and local payment methods day one.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pillar 1: Courier & Order Tracking */}
          <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-emerald-500/40 transition-all shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TruckIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Native Courier Tracking (`/order-tracking`)
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Customers track orders live on your own store domain with a 6-step visual status timeline and 1-click direct tracking resolvers for all major Pakistani couriers.
              </p>

              <div className="pt-2 grid grid-cols-2 gap-2">
                {COURIERS.map((courier) => (
                  <div
                    key={courier.name}
                    className={`p-2.5 rounded-xl border text-xs font-semibold ${courier.color}`}
                  >
                    <div className="font-bold">{courier.name}</div>
                    <div className="text-[10px] opacity-80">{courier.badge}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-neutral-300 flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Includes Couriers Next, TCS, PostEx, Trax, Leopards &amp; CallCourier</span>
            </div>
          </div>

          {/* Pillar 2: WhatsApp Commerce */}
          <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-emerald-500/40 transition-all shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                WhatsApp Order Updates &amp; Chat
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Keep customers engaged directly on WhatsApp. Share automated live order tracking links and provide instant customer support without leaving WhatsApp.
              </p>

              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <span>💬 Instant Customer Notification</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-[11px] leading-relaxed font-mono">
                  &quot;Your order #ORD-1002 has been dispatched via Couriers Next (Tracking #: CN-98765432). Track live: store.com/order-tracking&quot;
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-neutral-300 flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct WhatsApp Float Button + Tracking Link Pre-fills</span>
            </div>
          </div>

          {/* Pillar 3: Local Payment Gateways */}
          <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-emerald-500/40 transition-all shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <BanknotesIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                JazzCash, EasyPaisa &amp; COD
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Offer your customers their preferred local payment options at checkout with instructions, account numbers, and payment proof upload capability.
              </p>

              <div className="space-y-2.5">
                {PAYMENTS.map((payment) => (
                  <div
                    key={payment.name}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5"
                  >
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{payment.name}</h4>
                      <p className="text-[11px] text-neutral-400">{payment.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-neutral-300 flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>PKR Storefront &amp; Tax Calculation pre-configured</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(PakistanEcosystemSection);
