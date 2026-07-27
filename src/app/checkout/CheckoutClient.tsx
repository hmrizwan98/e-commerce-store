"use client";

import { useEffect, useState } from "react";
import Prices from "@/components/Prices";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/utils/hooks/store";
import { clearCart } from "@/store/slices/cartSlice";
import { computeOrderTotals } from "@/lib/checkout/totals";
import { placeGuestOrder } from "./actions";
import { trackEvent } from "@/lib/analytics/track";
import ContactInfo from "./ContactInfo";
import ShippingAddress, { type ShippingAddressValue } from "./ShippingAddress";
import PaymentMethod from "./PaymentMethod";
import type { PaymentMethod as PaymentMethodValue } from "@/types/order";
import type { PaymentSettings } from "@/types/site-settings";

export interface CheckoutClientProps {
  shippingFlatRate: number;
  freeShippingThreshold?: number;
  taxRatePercent: number;
  taxInclusive: boolean;
  paymentSettings: PaymentSettings;
}

const CheckoutClient: React.FC<CheckoutClientProps> = ({
  shippingFlatRate,
  freeShippingThreshold,
  taxRatePercent,
  taxInclusive,
  paymentSettings,
}) => {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();

  const [tabActive, setTabActive] = useState<
    "ContactInfo" | "ShippingAddress" | "PaymentMethod"
  >("ContactInfo");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [shipping, setShipping] = useState<ShippingAddressValue>({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    country: "Pakistan",
    state: "",
    postalCode: "",
    addressType: "home",
  });
  const defaultMethod =
    (["cod", "bank_transfer", "jazzcash"] as PaymentMethodValue[]).find(
      (m) => (m === "bank_transfer" ? paymentSettings.bankTransfer : paymentSettings[m]).enabled
    ) ?? "cod";
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>(defaultMethod);
  const [transactionRef, setTransactionRef] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{ orderNumber: string } | null>(null);

  const handleScrollToEl = (id: string) => {
    const element = document.getElementById(id);
    setTimeout(() => {
      element?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totals = computeOrderTotals({
    subtotal,
    shippingFlatRate,
    freeShippingThreshold,
    taxRatePercent,
    taxInclusive,
  });

  useEffect(() => {
    if (items.length) trackEvent("checkout_start", { value: subtotal });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmOrder = async () => {
    setError(null);
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      setTabActive("ContactInfo");
      handleScrollToEl("ContactInfo");
      return;
    }
    if (!shipping.fullName.trim() || !shipping.line1.trim() || !shipping.city.trim()) {
      setError("Please complete your shipping address.");
      setTabActive("ShippingAddress");
      handleScrollToEl("ShippingAddress");
      return;
    }

    setSubmitting(true);
    try {
      const result = await placeGuestOrder({
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        guestName: shipping.fullName,
        guestEmail: email,
        shippingAddress: {
          fullName: shipping.fullName,
          phone,
          line1: shipping.line1,
          line2: shipping.line2 || undefined,
          city: shipping.city,
          state: shipping.state || undefined,
          postalCode: shipping.postalCode || undefined,
          country: shipping.country,
        },
        paymentMethod,
        paymentTransactionRef: transactionRef || undefined,
      });
      dispatch(clearCart());
      trackEvent("payment_success", { value: totals.total });
      trackEvent("order_success", { value: totals.total });
      setConfirmedOrder(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong placing your order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="nc-CheckoutPage">
        <main className="container py-16 lg:pb-28 lg:pt-20 max-w-2xl">
          <div className="flex flex-col items-center text-center space-y-6 py-16">
            <h2 className="text-2xl sm:text-3xl font-semibold">Thank you for your order!</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Your order <span className="font-semibold text-slate-900 dark:text-slate-100">{confirmedOrder.orderNumber}</span> has
              been placed. Save this number to track your order.
            </p>
            <Link href={`/order-tracking?orderNumber=${confirmedOrder.orderNumber}&email=${encodeURIComponent(email)}` as any}>
              <ButtonPrimary>Track your order</ButtonPrimary>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const renderProduct = (item: (typeof items)[number]) => {
    const { productId, variantId, image, price, name, quantity, variantLabel, slug } = item;
    return (
      <div key={`${productId}-${variantId ?? ""}`} className="relative flex py-7 first:pt-0 last:pb-0">
        <div className="relative h-36 w-24 sm:w-28 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {image && (
            <Image
              src={image}
              fill
              alt={name}
              className="h-full w-full object-contain object-center"
              sizes="150px"
            />
          )}
          <Link href={`/product/${slug}` as any} className="absolute inset-0"></Link>
        </div>

        <div className="ml-3 sm:ml-6 flex flex-1 flex-col">
          <div className="flex justify-between ">
            <div className="flex-[1.5] ">
              <h3 className="text-base font-semibold">
                <Link href={`/product/${slug}` as any}>{name}</Link>
              </h3>
              {variantLabel && (
                <div className="mt-1.5 sm:mt-2.5 text-sm text-slate-600 dark:text-slate-300">
                  {variantLabel}
                </div>
              )}
              <div className="mt-2 text-sm text-slate-500">Qty {quantity}</div>
            </div>

            <div className="hidden flex-1 sm:flex justify-end">
              <Prices price={price * quantity} className="mt-0.5" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLeft = () => {
    return (
      <div className="space-y-8">
        <div id="ContactInfo" className="scroll-mt-24">
          <ContactInfo
            isActive={tabActive === "ContactInfo"}
            phone={phone}
            email={email}
            onChange={(patch) => {
              if (patch.phone !== undefined) setPhone(patch.phone);
              if (patch.email !== undefined) setEmail(patch.email);
            }}
            onOpenActive={() => {
              setTabActive("ContactInfo");
              handleScrollToEl("ContactInfo");
            }}
            onCloseActive={() => {
              setTabActive("ShippingAddress");
              handleScrollToEl("ShippingAddress");
            }}
          />
        </div>

        <div id="ShippingAddress" className="scroll-mt-24">
          <ShippingAddress
            isActive={tabActive === "ShippingAddress"}
            value={shipping}
            onChange={(patch) => setShipping((prev) => ({ ...prev, ...patch }))}
            onOpenActive={() => {
              setTabActive("ShippingAddress");
              handleScrollToEl("ShippingAddress");
            }}
            onCloseActive={() => {
              setTabActive("PaymentMethod");
              handleScrollToEl("PaymentMethod");
            }}
          />
        </div>

        <div id="PaymentMethod" className="scroll-mt-24">
          <PaymentMethod
            isActive={tabActive === "PaymentMethod"}
            paymentSettings={paymentSettings}
            method={paymentMethod}
            onMethodChange={setPaymentMethod}
            transactionRef={transactionRef}
            onTransactionRefChange={setTransactionRef}
            onOpenActive={() => {
              setTabActive("PaymentMethod");
              handleScrollToEl("PaymentMethod");
            }}
            onCloseActive={() => setTabActive("PaymentMethod")}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="nc-CheckoutPage">
      <main className="container py-16 lg:pb-28 lg:pt-20 ">
        <div className="mb-16">
          <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold ">
            Checkout
          </h2>
          <div className="block mt-3 sm:mt-5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-400">
            <Link href={"/"} className="">
              Homepage
            </Link>
            <span className="text-xs mx-1 sm:mx-1.5">/</span>
            <Link href={"/collection-2"} className="">
              Clothing Categories
            </Link>
            <span className="text-xs mx-1 sm:mx-1.5">/</span>
            <span className="underline">Checkout</span>
          </div>
        </div>

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
            <div className="flex-1">{renderLeft()}</div>

            <div className="flex-shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 my-10 lg:my-0 lg:mx-10 xl:lg:mx-14 2xl:mx-16 "></div>

            <div className="w-full lg:w-[36%] ">
              <h3 className="text-lg font-semibold">Order summary</h3>
              <div className="mt-8 divide-y divide-slate-200/70 dark:divide-slate-700 ">
                {items.map(renderProduct)}
              </div>

              <div className="mt-10 pt-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200/70 dark:border-slate-700 ">
                <div className="flex justify-between py-2.5">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    ${totals.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span>Shipping estimate</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {totals.shippingCost === 0 ? "Free" : `$${totals.shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between py-2.5">
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

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
                  {error}
                </div>
              )}

              <ButtonPrimary
                className="mt-8 w-full"
                onClick={handleConfirmOrder}
                disabled={submitting}
              >
                {submitting ? "Placing order…" : "Confirm order"}
              </ButtonPrimary>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CheckoutClient;
