"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Prices from "@/components/Prices";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import type { CartDrawerPanelProps } from "./StandardCartDrawer";

export default function CompactCartDrawer({ items, subtotal, onRemove, close }: CartDrawerPanelProps) {
  return (
    <div className="relative bg-[var(--card)] border-2 border-[var(--border)]">
      <div className="max-h-[60vh] p-4 overflow-y-auto hiddenScrollbar">
        <h3 className="text-lg font-black uppercase tracking-tight text-[var(--heading)]">Cart ({items.length})</h3>
        {items.length ? (
          <div className="divide-y divide-[var(--border)] mt-2">
            {items.map((item) => {
              const { productId, variantId, name, price, image, quantity, slug } = item;
              return (
                <div key={`${productId}-${variantId ?? ""}`} className="flex items-center gap-3 py-3">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-[var(--surface)]">
                    {image && <Image fill src={image} alt={name} className="h-full w-full object-contain object-center" />}
                    <Link onClick={close} className="absolute inset-0" href={`/product/${slug}` as any} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold uppercase truncate text-[var(--heading)]">
                      <Link onClick={close} href={`/product/${slug}` as any}>
                        {name}
                      </Link>
                    </h4>
                    <p className="text-xs text-[var(--muted)]">Qty {quantity}</p>
                  </div>
                  <Prices price={price * quantity} contentClass="text-sm font-black" />
                  <button type="button" className="text-xs font-bold uppercase text-[var(--primary-600,#dc2626)]" onClick={() => onRemove(item)}>
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]">Your cart is empty.</p>
        )}
      </div>
      <div className="bg-[var(--surface)] p-4 border-t-2 border-[var(--border)]">
        <p className="flex justify-between font-black text-[var(--heading)] uppercase text-sm">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </p>
        <div className="flex gap-2 mt-3">
          <ButtonSecondary href="/cart" onClick={close} className="flex-1 uppercase font-bold tracking-wider text-xs py-2.5 border-2 border-[var(--border)]">
            View Cart
          </ButtonSecondary>
          <ButtonPrimary href="/checkout" onClick={close} className="flex-1 uppercase font-bold tracking-wider text-xs py-2.5">
            Checkout
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
