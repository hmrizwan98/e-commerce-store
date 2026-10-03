/** Store currency formatting - the ONE place a money amount becomes display text, driven
 * by the store's own General Settings (currency / currencySymbol) instead of a hardcoded
 * "$". Pure (no server/client-only imports) so server pages, client components and emails
 * all share it. */

export interface CurrencySettings {
  currency?: string;
  currencySymbol?: string;
}

/** Matches DEFAULT_GENERAL_SETTINGS (site-settings.ts) - used only when a store has none. */
const FALLBACK: Required<CurrencySettings> = { currency: "PKR", currencySymbol: "Rs" };

export function currencySymbolOf(settings?: CurrencySettings | null): string {
  return settings?.currencySymbol?.trim() || settings?.currency?.trim() || FALLBACK.currencySymbol;
}

/**
 * "Rs. 1,450" / "Rs. 1,450.50" / "$145" / "€99.90". Whole amounts drop the decimals;
 * fractional amounts always show two. A word-like symbol ("Rs", "Rs.", "PKR") gets a space.
 * `fixedDecimals` forces two decimals (e.g. invoice/summary columns).
 */
export function formatMoney(
  amount: number | null | undefined,
  settings?: CurrencySettings | null,
  opts: { fixedDecimals?: boolean } = {}
): string {
  const value = Number.isFinite(amount) ? (amount as number) : 0;
  const hasFraction = Math.round(Math.abs(value) * 100) % 100 !== 0;
  const digits = opts.fixedDecimals || hasFraction ? 2 : 0;
  const number = Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const symbol = currencySymbolOf(settings);
  const separator = /[A-Za-z.]$/.test(symbol) ? " " : "";
  return `${value < 0 ? "-" : ""}${symbol}${separator}${number}`;
}
