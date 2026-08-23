"use client";

import { useEffect, useState, useRef } from "react";
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
  storeWhatsappNumber?: string;
}

const CheckoutClient: React.FC<CheckoutClientProps> = ({
  shippingFlatRate,
  freeShippingThreshold,
  taxRatePercent,
  taxInclusive,
  paymentSettings,
  storeWhatsappNumber,
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
  const [idempotencyKey, setIdempotencyKey] = useState(() => "chk_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9));

  const cartFingerprint = items.map((i) => `${i.productId}:${i.variantId || ""}:${i.quantity}`).join("|");
  const prevFingerprintRef = useRef(cartFingerprint);

  useEffect(() => {
    if (prevFingerprintRef.current !== cartFingerprint) {
      prevFingerprintRef.current = cartFingerprint;
      setIdempotencyKey("chk_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9));
    }
  }, [cartFingerprint]);

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
    if (!phone.trim() && !email.trim()) {
      setError("Please enter your phone number to receive order updates.");
      setTabActive("ContactInfo");
      handleScrollToEl("ContactInfo");
      return;
    }
    if (!shipping.fullName.trim()) {
      setError("Please enter the Recipient Full Name in shipping address.");
      setTabActive("ShippingAddress");
      handleScrollToEl("ShippingAddress");
      return;
    }
    if (!shipping.line1.trim()) {
      setError("Please enter your street address, house #, or village/area.");
      setTabActive("ShippingAddress");
      handleScrollToEl("ShippingAddress");
      return;
    }
    if (!shipping.city.trim()) {
      setError("Please enter your city/town.");
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
        guestEmail: email.trim(),
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
        idempotencyKey,
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
    const waText = encodeURIComponent(
      `🛒 *New Order Confirmation*\n\nHi Store Team! I just placed Order *#${confirmedOrder.orderNumber}* on your website.\n\n👤 *Name:* ${shipping.fullName}\n📞 *Phone:* ${phone}\n📍 *Address:* ${[shipping.line1, shipping.city].filter(Boolean).join(", ")}\n💰 *Total Amount:* $${totals.total.toFixed(2)}\n\nPlease confirm my order. Thank you!`
    );
    const waUrl = storeWhatsappNumber ? `https://wa.me/${storeWhatsappNumber}?text=${waText}` : "";

    return (
      <div className="nc-CheckoutPage">
        <main className="container py-16 lg:pb-28 lg:pt-20 max-w-2xl">
          <div className="flex flex-col items-center text-center space-y-6 py-12 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-3xl shadow-xs">
              🎉
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                Order Placed Successfully
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-3">
                Thank You For Your Order!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Order Reference Number:{" "}
                <span className="font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                  #{confirmedOrder.orderNumber}
                </span>
              </p>
            </div>

            {/* Direct WhatsApp Confirmation Button (Rendered ONLY if Store Admin configured a number!) */}
            {storeWhatsappNumber ? (
              <div className="w-full bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5 space-y-3">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  ⚡ Want instant updates on WhatsApp? Tap below to send your order reference directly to our support team:
                </p>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-extrabold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  💬 Confirm &amp; Track Order via WhatsApp →
                </a>
              </div>
            ) : null}

            <div className="flex items-center gap-3 pt-2">
              <Link href={`/order-tracking?orderNumber=${confirmedOrder.orderNumber}&email=${encodeURIComponent(email)}` as any}>
                <ButtonPrimary className="text-xs !py-2.5">Track Order Status</ButtonPrimary>
              </Link>
              <Link href={"/collection" as any}>
                <ButtonPrimary className="text-xs !py-2.5 !bg-slate-800 hover:!bg-slate-900">
                  Continue Shopping
                </ButtonPrimary>
              </Link>
            </div>
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
              <span className="text-xs mx-1 sm:mx-1.5 text-slate-400">/</span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold">Checkout</span>
            </div>
          </div>

          {!items.length ? (
            <div className="flex flex-col items-center py-20 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center text-2xl">
                🛍️
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Your cart is empty</h3>
                <p className="text-sm text-slate-500 mt-1">Explore our catalog to add items before checking out.</p>
              </div>
              <Link href={"/collection" as any}>
                <ButtonPrimary className="shadow-md">Explore Products →</ButtonPrimary>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 xl:col-span-8">{renderLeft()}</div>

              <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs sticky top-24 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Order Summary ({items.length} {items.length === 1 ? "Item" : "Items"})
                  </h3>
                  <Link href="/cart" className="text-xs text-indigo-600 font-bold hover:underline">
                    Edit Cart
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto pr-1">
                  {items.map(renderProduct)}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      ${totals.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {totals.shippingCost === 0 ? "Free" : `$${totals.shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      ${totals.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-extrabold text-slate-900 dark:text-slate-100 text-base pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span>Total Amount</span>
                    <span className="text-indigo-600 dark:text-indigo-400">${totals.total.toFixed(2)}</span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center gap-2">
                    ⚠️ {error}
                  </div>
                )}

                <ButtonPrimary
                  className="w-full !py-3 text-sm font-extrabold shadow-md shadow-indigo-500/20"
                  onClick={handleConfirmOrder}
                  disabled={submitting}
                >
                  {submitting ? "Placing Your Order..." : "Confirm & Place Order →"}
                </ButtonPrimary>

                <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                  🔒 256-bit Encrypted Checkout · 100% Guaranteed Delivery
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  };

export default CheckoutClient;
