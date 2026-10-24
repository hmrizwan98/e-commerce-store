"use client";

import React from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { Transition } from "@/app/headlessui";
import Prices from "@/components/Prices";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { getCartUrl } from "@/utils/getCartUrl";
import { useRouter } from "next/navigation";
import { useAddToCart } from "@/hooks/useAddToCart";
import type { Product } from "@/types/product";

export interface AddToBagToastOptions {
  product: Pick<Product, "id" | "name" | "price" | "compareAtPrice" | "images">;
  size?: string;
  colorLabel?: string;
}

/** The "added to bag" toast shared by every product-card variant. Only shown AFTER the
 * item was really added (see useCardAddToBag below) - it used to be shown on its own,
 * without adding anything to the cart. */
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
              <Link
                href={getCartUrl() as any}
                className="font-semibold text-primary-6000 dark:text-primary-500 hover:underline transition-all cursor-pointer"
                onClick={() => {
                  toast.dismiss();
                }}
              >
                View cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}

/**
 * "Add to bag" straight from a product card (every theme variant + the default card):
 * - simple product: really adds 1 to the cart (shared cartSlice path via useAddToCart,
 *   with the fly-to-cart animation from the clicked button), then shows the toast;
 * - product with variants: a card can't know which variant was meant, so it opens the
 *   product page to choose (never adds a wrong/variant-less line);
 * - out of stock: says so instead of adding.
 */
export function useCardAddToBag() {
  const addToCart = useAddToCart();
  const router = useRouter();
  return (
    product: Pick<Product, "id" | "name" | "slug" | "price" | "compareAtPrice" | "images" | "hasVariants" | "stock" | "trackInventory">,
    opts: { size?: string; colorLabel?: string; source?: Element | null } = {}
  ) => {
    if (product.hasVariants) {
      toast("Choose your options on the product page", { id: `choose-${product.id}`, icon: "👉" });
      router.push(`/product/${product.slug}` as any);
      return;
    }
    if (product.trackInventory && product.stock <= 0) {
      toast.error(`${product.name} is out of stock.`, { id: `oos-${product.id}` });
      return;
    }
    addToCart({
      product: product as Product,
      activeImage: product.images[0],
      activePrice: product.price,
      activeStock: product.stock,
      variantLabel: [opts.colorLabel, opts.size].filter(Boolean).join(" / "),
      quantity: 1,
      source: opts.source,
    });
    showAddToBagToast({ product, size: opts.size, colorLabel: opts.colorLabel });
  };
}
