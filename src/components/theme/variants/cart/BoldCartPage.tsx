"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import NcInputNumber from "@/components/NcInputNumber";
import Prices from "@/components/Prices";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { useCartPageState } from "./useCartPageState";
import type { CartClientProps } from "@/app/cart/CartClient";
import type { CartItem } from "@/store/slices/cartSlice";
import type { CartThemeConfig } from "@/lib/theme/theme-types";

export interface BoldCartPageProps extends CartClientProps {
  itemLayout?: CartThemeConfig["itemLayout"];
}

export default function BoldCartPage({ shippingFlatRate, freeShippingThreshold, taxRatePercent, taxInclusive, itemLayout = "compact" }: BoldCartPageProps) {
  const { items, totals, setQuantity, remove } = useCartPageState({ shippingFlatRate, freeShippingThreshold, taxRatePercent, taxInclusive });
  const compact = itemLayout === "compact";

  const renderProduct = (item: CartItem) => {
    const { productId, variantId, image, price, name, slug, quantity, maxStock, variantLabel } = item;

    return (
      <div key={`${productId}-${variantId ?? ""}`} className={`flex items-center gap-4 py-5 border-b-2 border-[var(--border)] ${compact ? "" : "flex-wrap"}`}>
        <div className={`relative ${compact ? "h-16 w-16" : "h-28 w-24"} flex-shrink-0 overflow-hidden rounded-md bg-[var(--surface)]`}>
          {image && <Image fill src={image} alt={name} sizes="150px" className="h-full w-full object-contain object-center" />}
          <Link href={`/product/${slug}` as any} className="absolute inset-0" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[var(--heading)] uppercase tracking-tight truncate">
            <Link href={`/product/${slug}` as any}>{name}</Link>
          </h3>
          {variantLabel && <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{variantLabel}</p>}
        </div>

        <NcInputNumber className="w-auto flex-shrink-0" defaultValue={quantity} min={1} max={maxStock || 99} onChange={(v) => setQuantity(productId, variantId, v)} />
        <Prices price={price * quantity} className="flex-shrink-0" contentClass="font-black" />
        <button
          type="button"
          onClick={() => remove(productId, variantId, price, quantity)}
          className="text-xs font-bold uppercase text-[var(--primary-600,#dc2626)] hover:underline flex-shrink-0"
        >
          Remove
        </button>
      </div>
    );
  };

  return (
    <div className="nc-CartPage">
      <main className="container py-16 lg:pb-28 lg:pt-20">
        <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[var(--heading)]">Shopping Cart</h2>
        <hr className="border-2 border-[var(--border)] my-8" />

        {!items.length ? (
          <div className="flex flex-col items-center py-20 space-y-6">
            <p className="text-[var(--muted)] text-lg font-bold uppercase">Your cart is empty.</p>
            <Link href={"/collection" as any}>
              <ButtonPrimary className="uppercase font-bold">Continue shopping</ButtonPrimary>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-[60%]">{items.map(renderProduct)}</div>
            <div className="flex-1">
              <div className="sticky top-28 bg-[var(--card)] border-2 border-[var(--border)] rounded-lg p-6">
                <h3 className="text-lg font-black uppercase tracking-tight text-[var(--heading)]">Order Summary</h3>
                <div className="mt-6 text-sm font-medium text-[var(--muted)] divide-y divide-[var(--border)]">
                  <div className="flex justify-between pb-4">
                    <span>Subtotal</span>
                    <span className="font-bold text-[var(--heading)]">${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span>Shipping</span>
                    <span className="font-bold text-[var(--heading)]">{totals.shippingCost === 0 ? "Free" : `$${totals.shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span>Tax</span>
                    <span className="font-bold text-[var(--heading)]">${totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-[var(--heading)] text-xl pt-4">
                    <span>Total</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </div>
                <ButtonPrimary href="/checkout" className="mt-8 w-full uppercase font-bold tracking-wider">
                  Checkout Now
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
