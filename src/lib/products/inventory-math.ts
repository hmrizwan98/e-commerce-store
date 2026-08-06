/** Pure calculations kept out of Firestore - both are derived from fields already on
 * Product, so storing them would just be denormalized state that goes stale on every
 * price/stock edit. Used by the admin Product form only. */

export interface ProfitMargin {
  profit: number;
  marginPercent: number;
}

export function calculateProfitMargin(costPrice: number | undefined, price: number): ProfitMargin | null {
  if (costPrice === undefined || costPrice === null || !Number.isFinite(costPrice)) return null;
  const profit = price - costPrice;
  const marginPercent = price > 0 ? (profit / price) * 100 : 0;
  return { profit, marginPercent };
}

export function calculateAvailableStock(stock: number, reservedStock: number | undefined): number {
  return Math.max(0, stock - (reservedStock ?? 0));
}
