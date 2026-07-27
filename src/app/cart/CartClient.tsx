"use client";

import { NoSymbolIcon, CheckIcon } from "@heroicons/react/24/outline";
import NcInputNumber from "@/components/NcInputNumber";
import Prices from "@/components/Prices";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/utils/hooks/store";
import { removeItem, updateQuantity, type CartItem } from "@/store/slices/cartSlice";
import { computeOrderTotals } from "@/lib/checkout/totals";
import { trackEvent } from "@/lib/analytics/track";

export interface CartClientProps {
  shippingFlatRate: number;
  freeShippingThreshold?: number;
  taxRatePercent: number;
  taxInclusive: boolean;
}

const CartClient: React.FC<CartClientProps> = ({
  shippingFlatRate,
  freeShippingThreshold,
  taxRatePercent,
  taxInclusive,
}) => {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totals = computeOrderTotals({
    subtotal,
    shippingFlatRate,
    freeShippingThreshold,
    taxRatePercent,
    taxInclusive,
  });

  const renderProduct = (item: CartItem) => {
    const { productId, variantId, image, price, name, slug, quantity, maxStock, variantLabel } = item;
    const inStock = maxStock > 0;

    return (
      <div
        key={`${productId}-${variantId ?? ""}`}
        className="relative flex py-8 sm:py-10 xl:py-12 first:pt-0 last:pb-0"
      >
        <div className="relative h-36 w-24 sm:w-32 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {image && (
            <Image
              fill
              src={image}
              alt={name}
              sizes="300px"
              className="h-full w-full object-contain object-center"
            />
          )}
          <Link href={`/product/${slug}` as any} className="absolute inset-0"></Link>
        </div>

        <div className="ml-3 sm:ml-6 flex flex-1 flex-col">
          <div>
            <div className="flex justify-between ">
              <div className="flex-[1.5] ">
                <h3 className="text-base font-semibold">
                  <Link href={`/product/${slug}` as any}>{name}</Link>
                </h3>
                {variantLabel && (
                  <div className="mt-1.5 sm:mt-2.5 flex text-sm text-slate-600 dark:text-slate-300">
                    <span>{variantLabel}</span>
                  </div>
                )}

                <div className="mt-3 flex justify-between w-full sm:hidden relative">
                  <NcInputNumber
                    defaultValue={quantity}
                    min={1}
                    max={maxStock || 99}
                    onChange={(value) =>
                      dispatch(updateQuantity({ productId, variantId, quantity: value }))
                    }
                  />
                  <Prices
                    contentClass="py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium h-full"
                    price={price}
                  />
                </div>
              </div>

              <div className="hidden sm:block text-center relative">
                <NcInputNumber
                  className="relative z-10"
                  defaultValue={quantity}
                  min={1}
                  max={maxStock || 99}
                  onChange={(value) =>
                    dispatch(updateQuantity({ productId, variantId, quantity: value }))
                  }
                />
              </div>

              <div className="hidden flex-1 sm:flex justify-end">
                <Prices price={price * quantity} className="mt-0.5" />
              </div>
            </div>
          </div>

          <div className="flex mt-auto pt-4 items-end justify-between text-sm">
            <div className="rounded-full flex items-center justify-center px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {inStock ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5" />
                  <span className="ml-1 leading-none">In Stock</span>
                </>
              ) : (
                <>
                  <NoSymbolIcon className="w-3.5 h-3.5" />
                  <span className="ml-1 leading-none">Sold Out</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                dispatch(removeItem({ productId, variantId }));
                trackEvent("remove_from_cart", { productId, value: price * quantity });
              }}
              className="relative z-10 flex items-center mt-3 font-medium text-primary-6000 hover:text-primary-500 text-sm "
            >
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="nc-CartPage">
      <main className="container py-16 lg:pb-28 lg:pt-20 ">
        <div className="mb-12 sm:mb-16">
          <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold ">
            Shopping Cart
          </h2>
          <div className="block mt-3 sm:mt-5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-400">
            <Link href={"/"} className="">
              Homepage
            </Link>
            <span className="text-xs mx-1 sm:mx-1.5">/</span>
            <Link href={"/collection"} className="">
              Clothing Categories
            </Link>
            <span className="text-xs mx-1 sm:mx-1.5">/</span>
            <span className="underline">Shopping Cart</span>
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-700 my-10 xl:my-12" />

        {!items.length ? (
          <div className="flex flex-col items-center py-20 space-y-6">
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">
              Your cart is empty.
            </p>
            <Link href={"/collection" as any}>
              <ButtonPrimary>Continue shopping</ButtonPrimary>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-[60%] xl:w-[55%] divide-y divide-slate-200 dark:divide-slate-700 ">
              {items.map(renderProduct)}
            </div>
            <div className="border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 my-10 lg:my-0 lg:mx-10 xl:mx-16 2xl:mx-20 flex-shrink-0"></div>
            <div className="flex-1">
              <div className="sticky top-28">
                <h3 className="text-lg font-semibold ">Order Summary</h3>
                <div className="mt-7 text-sm text-slate-500 dark:text-slate-400 divide-y divide-slate-200/70 dark:divide-slate-700/80">
                  <div className="flex justify-between pb-4">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      ${totals.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span>Shipping estimate</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {totals.shippingCost === 0 ? "Free" : `$${totals.shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span>Tax estimate</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      ${totals.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-200 text-base pt-4">
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
};

export default CartClient;
