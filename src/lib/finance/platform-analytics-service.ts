import "server-only";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { docData } from "@/lib/firebase/repositories/utils";
import { calculateOrderCommission, describePolicy, round2 } from "./commission";
import { getEffectiveCommissionPolicy } from "./commission-service";
import {
  ANALYTICS_RANGES,
  buildTrend,
  rangeBounds,
  summarizeLedger,
  type AnalyticsRange,
  type LedgerEntry,
  type TrendGranularity,
  type TrendPoint,
} from "./ledger-math";
import type { Store } from "@/types/store";
import type { OrderStatus, PaymentStatus } from "@/types/order";

/**
 * Super Admin platform analytics - server-authoritative, read with the Admin SDK and only
 * ever returned to a verified Super Admin (see superadmin dashboard actions).
 *
 * Revenue follows the existing finance rule: it is RECOGNISED when an order's payment is
 * marked paid (ledger "payment" entries), net of reversals and refunds - not when an order
 * is created. Order counts (delivered / pending / cancelled) come from orders created in the
 * selected range. Money is grouped by store currency and never summed across currencies.
 */

export { ANALYTICS_RANGES, rangeBounds, type AnalyticsRange };

export interface StoreAnalyticsRow {
  storeId: string;
  name: string;
  status: Store["status"];
  currencyKey: string;
  currency: { currency?: string; currencySymbol?: string };
  grossRevenue: number;
  netRevenue: number;
  refunds: number;
  commissionNet: number;
  /** Estimated commission on orders in range that aren't paid yet (current policy). */
  outstandingCommission: number;
  orders: number;
  deliveredOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  /** Delivered but payment not yet marked paid (e.g. COD cash not yet recorded). */
  deliveredUnpaid: number;
  policy: string;
}

export interface CurrencyTotals {
  currencyKey: string;
  currency: { currency?: string; currencySymbol?: string };
  stores: number;
  grossRevenue: number;
  netRevenue: number;
  refunds: number;
  commissionNet: number;
  outstandingCommission: number;
}

export interface PlatformAnalytics {
  generatedAt: number;
  range: AnalyticsRange;
  storeId: string | null;
  from: number;
  to: number;
  granularity: TrendGranularity;
  stores: StoreAnalyticsRow[];
  totals: CurrencyTotals[];
  /** Trend for the selected store, or for all stores sharing the most common currency. */
  trend: TrendPoint[];
  trendCurrencyKey: string | null;
  allStores: { id: string; name: string }[];
}

const OPEN: OrderStatus[] = ["pending", "confirmed", "processing", "packed", "shipped"];

async function analyseStore(store: Store, from: number, to: number) {
  const ref = adminDb().collection("stores").doc(store.id);
  const since = Timestamp.fromMillis(from);
  const [ledgerSnap, ordersSnap, general, policy] = await Promise.all([
    ref.collection("transactions").where("createdAt", ">=", since).select("orderId", "type", "amount", "commissionAmount", "createdAt").get(),
    ref.collection("orders").where("createdAt", ">=", since).select("orderStatus", "paymentStatus", "total", "createdAt").get(),
    ref.collection("siteSettings").doc("general").get(),
    getEffectiveCommissionPolicy(store.id, store),
  ]);
  const entries = ledgerSnap.docs.map((d) => docData<LedgerEntry>(d)).filter((e): e is LedgerEntry & { id: string } => e !== null);
  const orders = ordersSnap.docs
    .map((d) => docData<{ orderStatus: OrderStatus; paymentStatus: PaymentStatus; total: number; createdAt?: number }>(d))
    .filter((o): o is NonNullable<typeof o> => o !== null);
  const summary = summarizeLedger(entries);
  let delivered = 0;
  let pending = 0;
  let cancelled = 0;
  let deliveredUnpaid = 0;
  let outstanding = 0;
  for (const o of orders) {
    if (o.orderStatus === "delivered") delivered++;
    if (o.orderStatus === "cancelled" || o.orderStatus === "refunded") cancelled++;
    if (o.orderStatus === "pending") pending++;
    const unpaid = o.paymentStatus !== "paid" && o.paymentStatus !== "refunded";
    if (o.orderStatus === "delivered" && unpaid) deliveredUnpaid++;
    if (unpaid && (OPEN.includes(o.orderStatus) || o.orderStatus === "delivered")) {
      outstanding += calculateOrderCommission(o.total, policy).amount;
    }
  }
  const g = (general.data() ?? {}) as { currency?: string; currencySymbol?: string };
  const currencyKey = (g.currency || g.currencySymbol || "PKR").toUpperCase();
  const row: StoreAnalyticsRow = {
    storeId: store.id,
    name: store.brandName?.trim() || store.name,
    status: store.status,
    currencyKey,
    currency: { currency: g.currency, currencySymbol: g.currencySymbol },
    grossRevenue: summary.grossRevenue,
    netRevenue: summary.netRevenue,
    refunds: summary.refunds,
    commissionNet: summary.commissionNet,
    outstandingCommission: round2(outstanding),
    orders: orders.length,
    deliveredOrders: delivered,
    pendingOrders: pending,
    cancelledOrders: cancelled,
    deliveredUnpaid,
    policy: describePolicy(policy),
  };
  return { row, entries, orderTimes: orders.map((o) => o.createdAt ?? 0).filter((t) => t >= from && t <= to) };
}

function earliest(sources: { orderTimes: number[]; entries: LedgerEntry[] }[], fallback: number): number {
  let min = fallback;
  for (const s of sources) {
    for (const t of s.orderTimes) if (t > 0 && t < min) min = t;
    for (const e of s.entries) if (e.createdAt && e.createdAt < min) min = e.createdAt;
  }
  return min;
}

// Short per-instance cache: the dashboard refreshes every 30 s; several open tabs or quick
// filter flips shouldn't each re-read every store.
const cache = new Map<string, { at: number; data: PlatformAnalytics }>();
const CACHE_MS = 15000;

export async function getPlatformAnalytics(opts: { range: AnalyticsRange; storeId?: string | null }): Promise<PlatformAnalytics> {
  const range = ANALYTICS_RANGES.includes(opts.range) ? opts.range : "30d";
  const storeId = opts.storeId || null;
  const key = `${range}|${storeId ?? "*"}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;

  const { from, to, granularity } = rangeBounds(range);
  const storesSnap = await adminDb().collection("stores").get();
  const allStoreDocs = storesSnap.docs
    .map((d) => docData<Store>(d))
    .filter((s): s is Store => s !== null && s.status !== "archived");
  const selected = storeId ? allStoreDocs.filter((s) => s.id === storeId) : allStoreDocs;

  // Bounded concurrency - each store is a few small, range-limited reads.
  const results: Awaited<ReturnType<typeof analyseStore>>[] = [];
  for (let i = 0; i < selected.length; i += 8) {
    results.push(...(await Promise.all(selected.slice(i, i + 8).map((s) => analyseStore(s, from, to)))));
  }

  const totalsMap = new Map<string, CurrencyTotals>();
  for (const { row } of results) {
    const t = totalsMap.get(row.currencyKey) ?? {
      currencyKey: row.currencyKey,
      currency: row.currency,
      stores: 0,
      grossRevenue: 0,
      netRevenue: 0,
      refunds: 0,
      commissionNet: 0,
      outstandingCommission: 0,
    };
    t.stores++;
    t.grossRevenue = round2(t.grossRevenue + row.grossRevenue);
    t.netRevenue = round2(t.netRevenue + row.netRevenue);
    t.refunds = round2(t.refunds + row.refunds);
    t.commissionNet = round2(t.commissionNet + row.commissionNet);
    t.outstandingCommission = round2(t.outstandingCommission + row.outstandingCommission);
    totalsMap.set(row.currencyKey, t);
  }
  const totals = Array.from(totalsMap.values()).sort((a, b) => b.stores - a.stores);
  const trendCurrencyKey = totals[0]?.currencyKey ?? null;
  const trendSources = results.filter((r) => r.row.currencyKey === trendCurrencyKey);
  const trend = buildTrend(
    trendSources.flatMap((r) => r.entries),
    trendSources.flatMap((r) => r.orderTimes),
    range === "all" ? earliest(trendSources, to) : from,
    to,
    granularity
  );

  const data: PlatformAnalytics = {
    generatedAt: Date.now(),
    range,
    storeId,
    from,
    to,
    granularity,
    stores: results.map((r) => r.row).sort((a, b) => b.netRevenue - a.netRevenue),
    totals,
    trend,
    trendCurrencyKey,
    allStores: allStoreDocs.map((s) => ({ id: s.id, name: s.brandName?.trim() || s.name })).sort((a, b) => a.name.localeCompare(b.name)),
  };
  cache.set(key, { at: Date.now(), data });
  return data;
}
