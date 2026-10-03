"use client";

import React, { createContext, useCallback, useContext } from "react";
import { formatMoney, type CurrencySettings } from "./format";

const CurrencyContext = createContext<CurrencySettings | null>(null);

/** Fed from the root layout with the current store's General Settings currency. */
export const CurrencyProvider: React.FC<{ currency?: string; currencySymbol?: string; children: React.ReactNode }> = ({
  currency,
  currencySymbol,
  children,
}) => <CurrencyContext.Provider value={{ currency, currencySymbol }}>{children}</CurrencyContext.Provider>;

/** Client-side store money formatter (falls back to the platform default outside a provider). */
export function useFormatMoney() {
  const settings = useContext(CurrencyContext);
  return useCallback(
    (amount: number | null | undefined, opts?: { fixedDecimals?: boolean }) => formatMoney(amount, settings, opts),
    [settings]
  );
}
