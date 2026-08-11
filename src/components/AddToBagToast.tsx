"use client";

import React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Transition } from "@/app/headlessui";
import Prices from "@/components/Prices";
import { safeImageSrc } from "@/utils/safeImageSrc";
import type { Product } from "@/types/product";

export interface AddToBagToastOptions {
  product: Pick<Product, "id" | "name" | "price" | "compareAtPrice" | "images">;
  size?: string;
  colorLabel?: string;
}

/**
 * The real ProductCard's "Add to bag" toast never dispatches to the cart
 * (see cartSlice.ts - the only genuine add-to-cart path is the PDP). This is
 * that exact toast, extracted so every theme product-card variant shows the
 * byte-identical notification instead of a fourth independent copy.
 */
export function showAddToBagToast({ product, size, colorLabel }: AddToBagToastOptions) {
  const { name, price, compareAtPrice, images, id } = product;
  const image = safeImageSrc(images[0]);

  toast.custom(
    (t) => <AddToBagToastBody visible={t.visible} name={name} price={price} compareAtPrice={compareAtPrice} image={image} size={size} colorLabel={colorLabel} />,
    { position: "top-right", id: id || "product-detail", duration: 3000 }
  );
}

function AddToBagToastBody({
  visible,
  name,
  price,
  compareAtPrice,
  image,
  size,
  colorLabel,
}: {
  visible: boolean;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  size?: string;
  colorLabel?: string;
}) {
  const router = useRouter();

  return (
    <Transition
      appear
      show={visible}
      className="p-4 max-w-md w-full bg-white dark:bg-slate-800 shadow-lg rounded-2xl pointer-events-auto ring-1 ring-black/5 dark:ring-white/10 text-slate-900 dark:text-slate-200"
      enter="transition-all duration-150"
      enterFrom="opacity-0 translate-x-20"
      enterTo="opacity-100 translate-x-0"
      leave="transition-all duration-150"
      leaveFrom="opacity-100 translate-x-0"
      leaveTo="opacity-0 translate-x-20"
    >
      <p className="block text-base font-semibold leading-none">Added to cart!</p>
      <div className="border-t border-slate-200 dark:border-slate-700 my-4" />
      <div className="flex ">
        <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
          <Image width={80} height={96} src={image} alt={name} className="absolute object-cover object-center" />
        </div>

        <div className="ms-4 flex flex-1 flex-col">
          <div>
            <div className="flex justify-between ">
              <div>
                <h3 className="text-base font-medium ">{name}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  <span>{colorLabel || `Natural`}</span>
                  <span className="mx-2 border-s border-slate-200 dark:border-slate-700 h-4"></span>
                  <span>{size || "One size"}</span>
                </p>
              </div>
              <Prices price={price} compareAtPrice={compareAtPrice} className="mt-0.5" />
            </div>
          </div>
          <div className="flex flex-1 items-end justify-between text-sm">
            <p className="text-gray-500 dark:text-slate-400">Qty 1</p>

            <div className="flex">
              <button
                type="button"
                className="font-medium text-primary-6000 dark:text-primary-500 "
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/cart");
                }}
              >
                View cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}
