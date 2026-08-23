"use client";

import Label from "@/components/Label/Label";
import React, { FC } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Input from "@/shared/Input/Input";
import Radio from "@/shared/Radio/Radio";
import { CreditCardIcon, CheckIcon, BanknotesIcon, BuildingLibraryIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
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
  cod: "Cash on Delivery (COD)",
  bank_transfer: "Bank Transfer",
  jazzcash: "JazzCash / EasyPaisa",
};

const METHOD_ICONS: Record<PaymentMethodValue, any> = {
  cod: BanknotesIcon,
  bank_transfer: BuildingLibraryIcon,
  jazzcash: DevicePhoneMobileIcon,
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
    const IconComp = METHOD_ICONS[m];

    return (
      <div
        key={m}
        onClick={() => onMethodChange(m)}
        className={`p-4 rounded-xl border transition-all cursor-pointer ${
          active
            ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-2xs"
            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio
              name="payment-method"
              id={m}
              defaultChecked={active}
              onChange={() => onMethodChange(m)}
            />
            <div className="flex items-center gap-2">
              <IconComp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {METHOD_LABELS[m]}
              </span>
            </div>
          </div>
          {m === "cod" && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-md">
              Pay on Delivery
            </span>
          )}
        </div>

        {active && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
            {setting.instructions && (
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {setting.instructions}
              </p>
            )}
            {m !== "cod" && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                {setting.accountName && (
                  <div>
                    Account Name: <span className="font-bold text-slate-900 dark:text-white">{setting.accountName}</span>
                  </div>
                )}
                {setting.bankName && (
                  <div>
                    Bank/Provider: <span className="font-bold text-slate-900 dark:text-white">{setting.bankName}</span>
                  </div>
                )}
                {setting.accountNumber && (
                  <div>
                    Account/Mobile #: <span className="font-bold text-slate-900 dark:text-white">{setting.accountNumber}</span>
                  </div>
                )}
              </div>
            )}
            {m !== "cod" && (
              <div className="pt-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Transaction Reference / TRX ID (Required)
                </Label>
                <Input
                  className="mt-1.5"
                  value={transactionRef}
                  onChange={(e) => onTransactionRefChange(e.target.value)}
                  placeholder="e.g. TRX1298471928"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`border rounded-2xl transition-all ${
        isActive
          ? "border-indigo-600 dark:border-indigo-500 ring-4 ring-indigo-500/10 bg-white dark:bg-slate-900 shadow-md"
          : "border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 hover:border-slate-300"
      }`}
    >
      <div className="p-5 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              method
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                : isActive
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            }`}
          >
            <CreditCardIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                3. Payment Method
              </h3>
              {!isActive && method && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  <CheckIcon className="w-3 h-3" /> Selected
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
              {METHOD_LABELS[method]}
            </p>
          </div>
        </div>

        {!isActive && (
          <button
            type="button"
            onClick={onOpenActive}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors shrink-0 cursor-pointer"
          >
            Change
          </button>
        )}
      </div>

      {isActive && (
        <div className="border-t border-slate-100 dark:border-slate-800 p-5 sm:p-7 space-y-4">
          {availableMethods.length ? (
            availableMethods.map((m) => renderMethodOption(m))
          ) : (
            <p className="text-sm text-slate-500">
              No payment methods are currently enabled. Please contact store support.
            </p>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <ButtonPrimary
              type="button"
              className="sm:!px-7 shadow-sm"
              onClick={onCloseActive}
            >
              Confirm Payment Option →
            </ButtonPrimary>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;
