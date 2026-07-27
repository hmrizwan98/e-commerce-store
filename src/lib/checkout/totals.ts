export interface OrderTotalsInput {
  subtotal: number;
  shippingFlatRate: number;
  freeShippingThreshold?: number;
  taxRatePercent: number;
  taxInclusive: boolean;
}

export interface OrderTotals {
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeOrderTotals(input: OrderTotalsInput): OrderTotals {
  const { subtotal, shippingFlatRate, freeShippingThreshold, taxRatePercent, taxInclusive } = input;
  const shippingCost =
    freeShippingThreshold != null && subtotal >= freeShippingThreshold ? 0 : shippingFlatRate;
  const tax = taxInclusive ? 0 : round2(subtotal * (taxRatePercent / 100));
  const total = round2(subtotal + shippingCost + tax);
  return { subtotal: round2(subtotal), shippingCost: round2(shippingCost), tax, total };
}
