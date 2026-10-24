/**
 * Ledger arithmetic - pure, unit-tested. The ledger (stores/{id}/transactions) is
 * append-only; these functions derive every money figure from it.
 *
 * Entry types:
 * - payment  : revenue recognised (order payment status -> paid). Carries the commission
 *              charged + the policy snapshot used.
 * - reversal : a recognised payment taken back because the order was set back from paid
 *              (correction). Returns that payment's full commission.
 * - refund   : money returned to the customer (partial or full). Returns commission
 *              proportionally.
 *
 * Definitions (README "Commission & Platform Finance"):
 *   gross revenue  = payments - reversals
 *   net revenue    = gross revenue - refunds
 *   commission net = commission charged on payments - commission returned (reversals + refunds)
 */

export type LedgerEntryType = "payment" | "refund" | "reversal";

export interface LedgerEntry {
  orderId: string;
  type: LedgerEntryType;
  amount: number;
  commissionAmount?: number;
  createdAt?: number;
  storeId?: string;
}

export interface LedgerSummary {
  payments: number;
  reversals: number;
  refunds: number;
  grossRevenue: number;
  netRevenue: number;
  commissionCharged: number;
  commissionReturned: number;
  commissionNet: number;
  /** Orders with recognised (not reversed) payment. */
  paidOrders: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function summarizeLedger(entries: LedgerEntry[]): LedgerSummary {
  let payments = 0;
  let reversals = 0;
  let refunds = 0;
  let charged = 0;
  let returned = 0;
  for (const e of entries) {
    const amount = Number(e.amount) || 0;
    const commission = Number(e.commissionAmount) || 0;
    if (e.type === "payment") {
      payments += amount;
      charged += commission;
    } else if (e.type === "reversal") {
      reversals += amount;
      returned += commission;
    } else if (e.type === "refund") {
      refunds += amount;
      returned += commission;
    }
  }
  const byOrder = groupByOrder(entries);
  let paidOrders = 0;
  byOrder.forEach((list) => {
    if (orderLedgerState(list).isPaid) paidOrders++;
  });
  return {
    payments: r2(payments),
    reversals: r2(reversals),
    refunds: r2(refunds),
    grossRevenue: r2(payments - reversals),
    netRevenue: r2(payments - reversals - refunds),
    commissionCharged: r2(charged),
    commissionReturned: r2(returned),
    commissionNet: r2(charged - returned),
    paidOrders,
  };
}

export function groupByOrder(entries: LedgerEntry[]): Map<string, LedgerEntry[]> {
  const map = new Map<string, LedgerEntry[]>();
  for (const e of entries) {
    const list = map.get(e.orderId);
    if (list) list.push(e);
    else map.set(e.orderId, [e]);
  }
  return map;
}

export interface OrderLedgerState {
  /** A payment is currently recognised (payments outnumber reversals). */
  isPaid: boolean;
  /** Amount of the currently recognised payment (0 if none). */
  paidAmount: number;
  /** Commission charged on the currently recognised payment. */
  paidCommission: number;
  refunded: number;
  commissionReturnedOnRefunds: number;
  /** More payments than the order should ever have (payments - reversals > 1). */
  duplicatePayments: boolean;
}

/** State of ONE order's ledger entries - decides whether a new payment/reversal/refund
 * entry is allowed, so the same payment is never counted twice. */
export function orderLedgerState(entries: LedgerEntry[]): OrderLedgerState {
  const sorted = [...entries].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
  const payments = sorted.filter((e) => e.type === "payment");
  const reversals = sorted.filter((e) => e.type === "reversal");
  const refunds = sorted.filter((e) => e.type === "refund");
  const net = payments.length - reversals.length;
  const current = net > 0 ? payments[payments.length - 1] : undefined;
  return {
    isPaid: net > 0,
    paidAmount: current ? Number(current.amount) || 0 : 0,
    paidCommission: current ? Number(current.commissionAmount) || 0 : 0,
    refunded: r2(refunds.reduce((s, e) => s + (Number(e.amount) || 0), 0)),
    commissionReturnedOnRefunds: r2(refunds.reduce((s, e) => s + (Number(e.commissionAmount) || 0), 0)),
    duplicatePayments: net > 1,
  };
}

export type TrendGranularity = "day" | "month";

export interface TrendPoint {
  key: string;
  grossRevenue: number;
  netRevenue: number;
  commissionNet: number;
  orders: number;
}

function bucketKey(ms: number, granularity: TrendGranularity): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  if (granularity === "month") return `${y}-${m}`;
  return `${y}-${m}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** Revenue/commission per day (or month) from ledger entries, plus order counts from
 * order creation times. Every bucket in [from, to] is present (zero-filled). */
export function buildTrend(
  entries: LedgerEntry[],
  orderCreatedAts: number[],
  from: number,
  to: number,
  granularity: TrendGranularity
): TrendPoint[] {
  const points = new Map<string, TrendPoint>();
  const step = granularity === "day" ? 86400000 : 0;
  if (granularity === "day") {
    for (let t = from; t <= to; t += step) {
      const key = bucketKey(t, "day");
      points.set(key, { key, grossRevenue: 0, netRevenue: 0, commissionNet: 0, orders: 0 });
    }
  } else {
    const d = new Date(from);
    const end = new Date(to);
    let y = d.getUTCFullYear();
    let m = d.getUTCMonth();
    while (y < end.getUTCFullYear() || (y === end.getUTCFullYear() && m <= end.getUTCMonth())) {
      const key = `${y}-${String(m + 1).padStart(2, "0")}`;
      points.set(key, { key, grossRevenue: 0, netRevenue: 0, commissionNet: 0, orders: 0 });
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }
  }
  for (const e of entries) {
    if (e.createdAt === undefined || e.createdAt < from || e.createdAt > to) continue;
    const p = points.get(bucketKey(e.createdAt, granularity));
    if (!p) continue;
    const amount = Number(e.amount) || 0;
    const commission = Number(e.commissionAmount) || 0;
    if (e.type === "payment") {
      p.grossRevenue += amount;
      p.netRevenue += amount;
      p.commissionNet += commission;
    } else if (e.type === "reversal") {
      p.grossRevenue -= amount;
      p.netRevenue -= amount;
      p.commissionNet -= commission;
    } else {
      p.netRevenue -= amount;
      p.commissionNet -= commission;
    }
  }
  for (const ms of orderCreatedAts) {
    if (ms < from || ms > to) continue;
    const p = points.get(bucketKey(ms, granularity));
    if (p) p.orders++;
  }
  return Array.from(points.values()).map((p) => ({
    ...p,
    grossRevenue: r2(p.grossRevenue),
    netRevenue: r2(p.netRevenue),
    commissionNet: r2(p.commissionNet),
  }));
}

/** Dashboard date ranges - all bounds are UTC; "mtd" = since the 1st of this month. */
export type AnalyticsRange = "mtd" | "7d" | "30d" | "90d" | "12m" | "all";
export const ANALYTICS_RANGES: AnalyticsRange[] = ["mtd", "7d", "30d", "90d", "12m", "all"];

const DAY = 86400000;

export function rangeBounds(range: AnalyticsRange, now = Date.now()): { from: number; to: number; granularity: TrendGranularity } {
  const startOfToday = Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate());
  if (range === "mtd") {
    const d = new Date(now);
    return { from: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1), to: now, granularity: "day" };
  }
  if (range === "7d") return { from: startOfToday - 6 * DAY, to: now, granularity: "day" };
  if (range === "30d") return { from: startOfToday - 29 * DAY, to: now, granularity: "day" };
  if (range === "90d") return { from: startOfToday - 89 * DAY, to: now, granularity: "day" };
  if (range === "12m") {
    const d = new Date(now);
    return { from: Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 11, 1), to: now, granularity: "month" };
  }
  return { from: 0, to: now, granularity: "month" };
}
