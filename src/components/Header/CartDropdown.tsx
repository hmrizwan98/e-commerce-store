"use client";

import { Popover, Transition } from "@/app/headlessui";
import { Fragment } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/utils/hooks/store";
import { removeItem, type CartItem } from "@/store/slices/cartSlice";
import { trackEvent } from "@/lib/analytics/track";
import StandardCartDrawer from "@/components/theme/variants/cart-drawer/StandardCartDrawer";
import CompactCartDrawer from "@/components/theme/variants/cart-drawer/CompactCartDrawer";
import MinimalCartDrawer from "@/components/theme/variants/cart-drawer/MinimalCartDrawer";
import type { CartThemeConfig } from "@/lib/theme/theme-types";

export interface CartDropdownProps {
  cartSettings?: CartThemeConfig;
}

export default function CartDropdown({ cartSettings }: CartDropdownProps) {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleRemove = (item: CartItem) => {
    dispatch(removeItem({ productId: item.productId, variantId: item.variantId }));
    trackEvent("remove_from_cart", { productId: item.productId, value: item.price * item.quantity });
  };

  const renderPanel = (close: () => void) => {
    switch (cartSettings?.drawerStyle) {
      case "compact":
        return <CompactCartDrawer items={items} subtotal={subtotal} onRemove={handleRemove} close={close} />;
      case "minimal":
        return <MinimalCartDrawer items={items} subtotal={subtotal} onRemove={handleRemove} close={close} />;
      default:
        return <StandardCartDrawer items={items} subtotal={subtotal} onRemove={handleRemove} close={close} />;
    }
  };

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button
            className={`
                ${open ? "" : "text-opacity-90"}
                 group w-10 h-10 sm:w-12 sm:h-12 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 relative`}
          >
            {itemCount > 0 && (
              <div className="w-3.5 h-3.5 flex items-center justify-center bg-primary-500 absolute top-1.5 right-1.5 rounded-full text-[10px] leading-none text-white font-medium">
                <span className="mt-[1px]">{itemCount}</span>
              </div>
            )}
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 2H3.74001C4.82001 2 5.67 2.93 5.58 4L4.75 13.96C4.61 15.59 5.89999 16.99 7.53999 16.99H18.19C19.63 16.99 20.89 15.81 21 14.38L21.54 6.88C21.66 5.22 20.4 3.87 18.73 3.87H5.82001"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.25 22C16.9404 22 17.5 21.4404 17.5 20.75C17.5 20.0596 16.9404 19.5 16.25 19.5C15.5596 19.5 15 20.0596 15 20.75C15 21.4404 15.5596 22 16.25 22Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.25 22C8.94036 22 9.5 21.4404 9.5 20.75C9.5 20.0596 8.94036 19.5 8.25 19.5C7.55964 19.5 7 20.0596 7 20.75C7 21.4404 7.55964 22 8.25 22Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 8H21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <Link className="block md:hidden absolute inset-0" href={"/cart"} />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="hidden md:block absolute z-10 w-screen max-w-xs sm:max-w-md px-4 mt-3.5 -right-28 sm:right-0 sm:px-0">
              <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10">{renderPanel(close)}</div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
