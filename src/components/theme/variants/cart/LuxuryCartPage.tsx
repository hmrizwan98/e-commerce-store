"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import NcInputNumber from "@/components/NcInputNumber";
import Prices from "@/components/Prices";
import { useCartPageState } from "./useCartPageState";
import type { CartClientProps } from "@/app/cart/CartClient";
import type { CartItem } from "@/store/slices/cartSlice";
import type { CartThemeConfig } from "@/lib/theme/theme-types";

export interface LuxuryCartPageProps extends CartClientProps {
  itemLayout?: CartThemeConfig["itemLayout"];
}

export default function LuxuryCartPage({ shippingFlatRate, freeShippingThreshold, taxRatePercent, taxInclusive }: LuxuryCartPageProps) {
  const { items, totals, setQuantity, remove } = useCartPageState({ shippingFlatRate, freeShippingThreshold, taxRatePercent, taxInclusive });

  const renderProduct = (item: CartItem) => {
    const { productId, variantId, image, price, name, slug, quantity, maxStock, variantLabel } = item;

    return (
      <div key={`${productId}-${variantId ?? ""}`} className="flex py-10 first:pt-0 last:pb-0 border-b border-[var(--border)] last:border-b-0">
        <div className="relative h-40 w-32 flex-shrink-0 overflow-hidden bg-[var(--surface)]">
          {image && <Image fill src={image} alt={name} sizes="200px" className="h-full w-full object-cover object-center" />}
          <Link href={`/product/${slug}` as any} className="absolute inset-0" />
        </div>

        <div className="ml-6 flex flex-1 flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg text-[var(--heading)] tracking-wide">
              <Link href={`/product/${slug}` as any}>{name}</Link>
            </h3>
            {variantLabel && <p className="mt-1 text-xs uppercase tracking-widest text-[var(--muted)]">{variantLabel}</p>}
            <Prices price={price} className="w-fit" contentClass="text-sm font-light tracking-wider mt-2" />
          </div>
          <div className="flex items-end justify-between">
            <NcInputNumber defaultValue={quantity} min={1} max={maxStock || 99} onChange={(v) => setQuantity(productId, variantId, v)} />
            <button
              type="button"
              onClick={() => remove(productId, variantId, price, quantity)}
              className="text-xs uppercase tracking-widest text-[var(--muted)] hover:text-[var(--heading)] border-b border-transparent hover:border-[var(--heading)]"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="nc-CartPage bg-[var(--background)]">
      <main className="container py-16 lg:pb-28 lg:pt-20">
        <h2 className="text-center font-serif text-3xl sm:text-4xl tracking-widest text-[var(--heading)]">Shopping Bag</h2>
        <hr className="border-[var(--border)] my-10 xl:my-14 max-w-3xl mx-auto" />

        {!items.length ? (
          <div className="flex flex-col items-center py-20 space-y-6">
            <p className="text-[var(--muted)] text-sm uppercase tracking-widest">Your bag is empty.</p>
            <Link href={"/collection" as any} className="text-xs uppercase tracking-widest border-b border-[var(--heading)] pb-0.5 text-[var(--heading)]">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:gap-20 max-w-5xl mx-auto">
            <div className="w-full lg:w-3/5">{items.map(renderProduct)}</div>
            <div className="w-full lg:w-2/5 mt-10 lg:mt-0">
              <div className="lg:sticky lg:top-28">
                <h3 className="text-xs uppercase tracking-widest text-[var(--muted)] pb-4 border-b border-[var(--border)]">Summary</h3>
                <div className="mt-6 text-sm text-[var(--muted)] space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[var(--heading)]">${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-[var(--heading)]">{totals.shippingCost === 0 ? "Complimentary" : `$${totals.shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="text-[var(--heading)]">${totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-serif text-lg text-[var(--heading)] pt-4 border-t border-[var(--border)]">
                    <span>Total</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className="mt-8 block text-center border border-[var(--heading)] text-[var(--heading)] py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-[var(--heading)] hover:text-[var(--background)] transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
