import React from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";

/**
 * Shown on the storefront's customer sign-in / sign-up / password pages. Stores don't have
 * customer accounts yet (checkout is guest-only), so instead of forms that do nothing, this
 * explains what does work. Store Admin and Super Admin sign-in are separate and unaffected.
 */
export default function CustomerAccountsUnavailable({ title }: { title: string }) {
  return (
    <div className="container mb-24 lg:mb-32">
      <div className="max-w-md mx-auto mt-16 sm:mt-24 text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-neutral-100">{title}</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Customer accounts aren&apos;t available on this store. You don&apos;t need one: check out as a guest, and track
          any order with its order number and the email or phone number you used at checkout.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <ButtonPrimary href={"/order-tracking" as any}>Track an order</ButtonPrimary>
          <ButtonSecondary href={"/" as any}>Continue shopping</ButtonSecondary>
        </div>
      </div>
    </div>
  );
}
