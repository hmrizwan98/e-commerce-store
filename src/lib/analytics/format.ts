import { formatMoney, type CurrencySettings } from "@/lib/currency/format";

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

/** Store-currency money text - pass the store's General Settings (see lib/currency/format.ts). */
export function formatCurrency(value: number, currency?: CurrencySettings | null): string {
  return formatMoney(value, currency);
}

export function formatPercent(value: number): string {
  return `${value}%`;
}
