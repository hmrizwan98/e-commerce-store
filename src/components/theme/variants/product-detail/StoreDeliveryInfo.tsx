"use client";

import React from "react";
import Link from "next/link";
import { TruckIcon, BanknotesIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useFormatMoney } from "@/lib/currency/CurrencyContext";
import { getTenantHref } from "@/utils/getTenantHref";
import type { PdpStoreInfo } from "@/app/product/[slug]/ProductDetailClient";

/**
 * Delivery / payment / returns facts for the product page, taken ONLY from the store's own
 * settings (Shipping + Payments). Replaces the template "Free shipping on orders over $50"
 * block, which every store showed regardless of its real settings. Renders nothing it can't back up.
 */
export default function StoreDeliveryInfo({ info, className = "" }: { info?: PdpStoreInfo; className?: string }) {
  const formatMoney = useFormatMoney();
  if (!info) return null;
  const rows: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [];

  if (typeof info.freeShippingThreshold === "number" && info.freeShippingThreshold > 0) {
    rows.push({
      icon: <TruckIcon className="w-5 h-5" />,
      label: "Delivery",
      value: `Free on orders over ${formatMoney(info.freeShippingThreshold)}${info.shippingFlatRate ? `, otherwise ${formatMoney(info.shippingFlatRate)}` : ""}`,
    });
  } else if (typeof info.shippingFlatRate === "number") {
    rows.push({
      icon: <TruckIcon className="w-5 h-5" />,
      label: "Delivery",
      value: info.shippingFlatRate > 0 ? `${formatMoney(info.shippingFlatRate)} per order` : "Free delivery",
    });
  }
  if (info.codEnabled) {
    rows.push({ icon: <BanknotesIcon className="w-5 h-5" />, label: "Payment", value: "Cash on Delivery available" });
  }
  rows.push({
    icon: <ArrowPathIcon className="w-5 h-5" />,
    label: "Returns",
    value: (
      <Link href={getTenantHref("/refund") as any} className="underline underline-offset-2 hover:text-[var(--heading,#0f172a)]">
        Read our return & refund policy
      </Link>
    ),
  });

  return (
    <div className={`rounded-2xl border border-[var(--border,#e2e8f0)] p-4 sm:p-5 ${className}`}>
      <p className="text-sm font-semibold text-[var(--heading,#0f172a)] mb-3">Delivery & Returns</p>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.label} className="flex items-start gap-3 text-sm text-[var(--muted,#64748b)]">
            <span className="mt-0.5 text-[var(--heading,#0f172a)]">{r.icon}</span>
            <span>
              <span className="font-medium text-[var(--heading,#0f172a)]">{r.label}: </span>
              {r.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
