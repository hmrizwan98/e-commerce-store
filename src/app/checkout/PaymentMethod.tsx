"use client";

import Label from "@/components/Label/Label";
import React, { FC } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Input from "@/shared/Input/Input";
import Radio from "@/shared/Radio/Radio";
import type { PaymentMethod as PaymentMethodValue } from "@/types/order";
import type { PaymentSettings } from "@/types/site-settings";

interface Props {
  isActive: boolean;
  onCloseActive: () => void;
  onOpenActive: () => void;
  paymentSettings: PaymentSettings;
  method: PaymentMethodValue;
  onMethodChange: (method: PaymentMethodValue) => void;
  transactionRef: string;
  onTransactionRefChange: (value: string) => void;
}

const METHOD_LABELS: Record<PaymentMethodValue, string> = {
  cod: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
  jazzcash: "JazzCash",
};

const PaymentMethod: FC<Props> = ({
  isActive,
  onCloseActive,
  onOpenActive,
  paymentSettings,
  method,
  onMethodChange,
  transactionRef,
  onTransactionRefChange,
}) => {
  const settingsFor = (m: PaymentMethodValue) =>
    m === "bank_transfer" ? paymentSettings.bankTransfer : paymentSettings[m];

  const availableMethods = (["cod", "bank_transfer", "jazzcash"] as PaymentMethodValue[]).filter(
    (m) => settingsFor(m).enabled
  );

  const renderMethodOption = (m: PaymentMethodValue) => {
    const active = method === m;
    const setting = settingsFor(m);
    return (
      <div key={m} className="flex items-start space-x-4 sm:space-x-6">
        <Radio
          className="pt-3.5"
          name="payment-method"
          id={m}
          defaultChecked={active}
          onChange={() => onMethodChange(m)}
        />
        <div className="flex-1">
          <label htmlFor={m} className="flex items-center space-x-4 sm:space-x-6">
            <p className="font-medium">{METHOD_LABELS[m]}</p>
          </label>

          <div className={`mt-4 mb-4 space-y-3 ${active ? "block" : "hidden"}`}>
            {setting.instructions && (
              <p className="text-sm dark:text-slate-300">{setting.instructions}</p>
            )}
            {m !== "cod" && (
              <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
                {setting.accountName && (
                  <li>
                    Account name:{" "}
                    <span className="text-slate-900 dark:text-slate-200 font-medium">
                      {setting.accountName}
                    </span>
                  </li>
                )}
                {setting.bankName && (
                  <li>
                    Bank name:{" "}
                    <span className="text-slate-900 dark:text-slate-200 font-medium">
                      {setting.bankName}
                    </span>
                  </li>
                )}
                {setting.accountNumber && (
                  <li>
                    Account number:{" "}
                    <span className="text-slate-900 dark:text-slate-200 font-medium">
                      {setting.accountNumber}
                    </span>
                  </li>
                )}
              </ul>
            )}
            {m !== "cod" && active && (
              <div className="max-w-lg">
                <Label className="text-sm">Transaction reference (after you&apos;ve sent payment)</Label>
                <Input
                  className="mt-1.5"
                  value={transactionRef}
                  onChange={(e) => onTransactionRefChange(e.target.value)}
                  placeholder="e.g. transaction ID / reference number"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentMethod = () => {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl ">
        <div className="p-6 flex flex-col sm:flex-row items-start">
          <span className="hidden sm:block">
            <svg
              className="w-6 h-6 text-slate-700 dark:text-slate-400 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.92969 15.8792L15.8797 3.9292"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.1013 18.2791L12.3013 17.0791"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.793 15.5887L16.183 13.1987"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.60127 10.239L10.2413 3.599C12.3613 1.479 13.4213 1.469 15.5213 3.569L20.4313 8.479C22.5313 10.579 22.5213 11.639 20.4013 13.759L13.7613 20.399C11.6413 22.519 10.5813 22.529 8.48127 20.429L3.57127 15.519C1.47127 13.419 1.47127 12.369 3.60127 10.239Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 21.9985H22"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="sm:ml-8">
            <h3 className=" text-slate-700 dark:text-slate-400 flex ">
              <span className="uppercase tracking-tight">PAYMENT METHOD</span>
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-5 h-5 ml-3 text-slate-900"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </h3>
            <div className="font-semibold mt-1 text-sm">
              <span className="">{METHOD_LABELS[method]}</span>
            </div>
          </div>
          <button
            className="py-2 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 mt-5 sm:mt-0 sm:ml-auto text-sm font-medium rounded-lg"
            onClick={onOpenActive}
          >
            Change
          </button>
        </div>

        <div
          className={`border-t border-slate-200 dark:border-slate-700 px-6 py-7 space-y-6 ${
            isActive ? "block" : "hidden"
          }`}
        >
          {availableMethods.length ? (
            availableMethods.map((m) => <div key={m}>{renderMethodOption(m)}</div>)
          ) : (
            <p className="text-sm text-slate-500">
              No payment methods are currently enabled. Please contact support.
            </p>
          )}

          <div className="flex pt-6">
            <ButtonPrimary className="w-full max-w-[240px]" onClick={onCloseActive}>
              Confirm
            </ButtonPrimary>
            <ButtonSecondary className="ml-3" onClick={onCloseActive}>
              Cancel
            </ButtonSecondary>
          </div>
        </div>
      </div>
    );
  };

  return renderPaymentMethod();
};

export default PaymentMethod;
