"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Prices from "@/components/Prices";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import type { CartItem } from "@/store/slices/cartSlice";

export interface CartDrawerPanelProps {
  items: CartItem[];
  subtotal: number;
  onRemove: (item: CartItem) => void;
  close: () => void;
}

/** Byte-identical to CartDropdown's own pre-theming JSX - the drawer's default, un-themed panel. */
export default function StandardCartDrawer({ items, subtotal, onRemove, close }: CartDrawerPanelProps) {
  return (
    <div className="relative bg-white dark:bg-neutral-800">
      <div className="max-h-[60vh] p-5 overflow-y-auto hiddenScrollbar">
        <h3 className="text-xl font-semibold">Shopping cart</h3>
        {items.length ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {items.map((item) => {
              const { productId, variantId, name, price, image, quantity, variantLabel, slug } = item;
              return (
                <div key={`${productId}-${variantId ?? ""}`} className="flex py-5 last:pb-0">
                  <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {image && <Image fill src={image} alt={name} className="h-full w-full object-contain object-center" />}
                    <Link onClick={close} className="absolute inset-0" href={`/product/${slug}` as any} />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between ">
                        <div>
                          <h3 className="text-base font-medium ">
                            <Link onClick={close} href={`/product/${slug}` as any}>
                              {name}
                            </Link>
                          </h3>
                          {variantLabel && (
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              <span>{variantLabel}</span>
                            </p>
                          )}
                        </div>
                        <Prices price={price} className="mt-0.5" />
                      </div>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <p className="text-gray-500 dark:text-slate-400">{`Qty ${quantity}`}</p>
                      <button type="button" className="font-medium text-primary-6000 dark:text-primary-500" onClick={() => onRemove(item)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Your cart is empty.</p>
        )}
      </div>
      <div className="bg-neutral-50 dark:bg-slate-900 p-5">
        <p className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
          <span>
            <span>Subtotal</span>
            <span className="block text-sm text-slate-500 dark:text-slate-400 font-normal">Shipping and taxes calculated at checkout.</span>
          </span>
          <span className="">${subtotal.toFixed(2)}</span>
        </p>
        <div className="flex space-x-2 mt-5">
          <ButtonSecondary href="/cart" className="flex-1 border border-slate-200 dark:border-slate-700" onClick={close}>
            View cart
          </ButtonSecondary>
          <ButtonPrimary href="/checkout" onClick={close} className="flex-1">
            Check out
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
