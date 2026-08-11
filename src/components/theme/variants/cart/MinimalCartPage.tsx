"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { NoSymbolIcon, CheckIcon } from "@heroicons/react/24/outline";
import NcInputNumber from "@/components/NcInputNumber";
import Prices from "@/components/Prices";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { useCartPageState } from "./useCartPageState";
import type { CartClientProps } from "@/app/cart/CartClient";
import type { CartItem } from "@/store/slices/cartSlice";
import type { CartThemeConfig } from "@/lib/theme/theme-types";

export interface MinimalCartPageProps extends CartClientProps {
  itemLayout?: CartThemeConfig["itemLayout"];
}

export default function MinimalCartPage({ shippingFlatRate, freeShippingThreshold, taxRatePercent, taxInclusive }: MinimalCartPageProps) {
  const { items, totals, setQuantity, remove } = useCartPageState({ shippingFlatRate, freeShippingThreshold, taxRatePercent, taxInclusive });

  const renderProduct = (item: CartItem) => {
    const { productId, variantId, image, price, name, slug, quantity, maxStock, variantLabel } = item;
    const inStock = maxStock > 0;

    return (
      <div key={`${productId}-${variantId ?? ""}`} className="relative flex py-8 first:pt-0 last:pb-0">
        <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-[var(--surface)]">
          {image && <Image fill src={image} alt={name} sizes="200px" className="h-full w-full object-contain object-center" />}
          <Link href={`/product/${slug}` as any} className="absolute inset-0" />
        </div>

        <div className="ml-4 flex flex-1 flex-col">
          <div className="flex justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--heading)]">
                <Link href={`/product/${slug}` as any}>{name}</Link>
              </h3>
              {variantLabel && <p className="mt-1.5 text-sm text-[var(--muted)]">{variantLabel}</p>}
            </div>
            <Prices price={price * quantity} className="mt-0.5" />
          </div>
          <div className="flex mt-auto pt-4 items-end justify-between text-sm">
            <NcInputNumber defaultValue={quantity} min={1} max={maxStock || 99} onChange={(v) => setQuantity(productId, variantId, v)} />
            <div className="flex flex-col items-end gap-2">
              <div className="rounded-full flex items-center px-2.5 py-1 text-xs text-[var(--muted)] border border-[var(--border)]">
                {inStock ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5" />
                    <span className="ml-1">In Stock</span>
                  </>
                ) : (
                  <>
                    <NoSymbolIcon className="w-3.5 h-3.5" />
                    <span className="ml-1">Sold Out</span>
                  </>
                )}
              </div>
              <button type="button" onClick={() => remove(productId, variantId, price, quantity)} className="font-medium text-primary-6000 text-sm">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="nc-CartPage">
      <main className="container py-16 lg:pb-28 lg:pt-20">
        <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--heading)]">Shopping Cart</h2>
        <hr className="border-[var(--border)] my-10 xl:my-12" />

        {!items.length ? (
          <div className="flex flex-col items-center py-20 space-y-6">
            <p className="text-[var(--muted)] text-lg">Your cart is empty.</p>
            <Link href={"/collection" as any}>
              <ButtonPrimary>Continue shopping</ButtonPrimary>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-[60%] xl:w-[55%] divide-y divide-[var(--border)]">{items.map(renderProduct)}</div>
            <div className="border-t lg:border-t-0 lg:border-l border-[var(--border)] my-10 lg:my-0 lg:mx-10 xl:mx-16 2xl:mx-20 flex-shrink-0" />
            <div className="flex-1">
              <div className="sticky top-28 bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6">
                <h3 className="text-lg font-semibold text-[var(--heading)]">Order Summary</h3>
                <div className="mt-6 text-sm text-[var(--muted)] divide-y divide-[var(--border)]">
                  <div className="flex justify-between pb-4">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[var(--heading)]">${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span>Shipping estimate</span>
                    <span className="font-semibold text-[var(--heading)]">{totals.shippingCost === 0 ? "Free" : `$${totals.shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span>Tax estimate</span>
                    <span className="font-semibold text-[var(--heading)]">${totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[var(--heading)] text-base pt-4">
                    <span>Order total</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </div>
                <ButtonPrimary href="/checkout" className="mt-8 w-full">
                  Checkout
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
