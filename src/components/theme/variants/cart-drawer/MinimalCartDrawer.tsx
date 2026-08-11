"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Prices from "@/components/Prices";
import type { CartDrawerPanelProps } from "./StandardCartDrawer";

export default function MinimalCartDrawer({ items, subtotal, onRemove, close }: CartDrawerPanelProps) {
  return (
    <div className="relative bg-[var(--card)]">
      <div className="max-h-[60vh] p-6 overflow-y-auto hiddenScrollbar">
        <h3 className="font-serif text-lg tracking-wide text-[var(--heading)]">Shopping Bag</h3>
        {items.length ? (
          <div className="divide-y divide-[var(--border)] mt-4">
            {items.map((item) => {
              const { productId, variantId, name, price, image, quantity, variantLabel, slug } = item;
              return (
                <div key={`${productId}-${variantId ?? ""}`} className="flex py-5 first:pt-0 last:pb-0">
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden bg-[var(--surface)]">
                    {image && <Image fill src={image} alt={name} className="h-full w-full object-cover object-center" />}
                    <Link onClick={close} className="absolute inset-0" href={`/product/${slug}` as any} />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-sm text-[var(--heading)] tracking-wide">
                        <Link onClick={close} href={`/product/${slug}` as any}>
                          {name}
                        </Link>
                      </h4>
                      {variantLabel && <p className="text-[11px] uppercase tracking-widest text-[var(--muted)] mt-1">{variantLabel}</p>}
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-xs text-[var(--muted)]">Qty {quantity}</p>
                      <Prices price={price} contentClass="text-sm font-light tracking-wider" />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-[var(--heading)] self-start ml-2"
                    onClick={() => onRemove(item)}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-xs uppercase tracking-widest text-[var(--muted)]">Your bag is empty.</p>
        )}
      </div>
      <div className="p-6 border-t border-[var(--border)]">
        <p className="flex justify-between text-sm text-[var(--heading)]">
          <span className="uppercase tracking-widest text-xs text-[var(--muted)] self-center">Subtotal</span>
          <span className="font-serif">${subtotal.toFixed(2)}</span>
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href="/cart"
            onClick={close}
            className="block text-center border border-[var(--border)] text-[var(--muted)] hover:text-[var(--heading)] hover:border-[var(--heading)] py-3 text-xs uppercase tracking-[0.2em] transition-colors"
          >
            View Cart
          </Link>
          <Link
            href="/checkout"
            onClick={close}
            className="block text-center border border-[var(--heading)] bg-[var(--heading)] text-[var(--background)] hover:bg-transparent hover:text-[var(--heading)] py-3 text-xs uppercase tracking-[0.2em] transition-colors"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
