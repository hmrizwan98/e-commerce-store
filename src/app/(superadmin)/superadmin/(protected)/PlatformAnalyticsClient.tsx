"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import CustomSelect from "@/components/admin/CustomSelect";
import { formatMoney } from "@/lib/currency/format";
import { getPlatformAnalyticsAction } from "./analytics-actions";
import type { AnalyticsRange, PlatformAnalytics } from "@/lib/finance/platform-analytics-service";
import type { TrendPoint } from "@/lib/finance/ledger-math";
import { startPoller, type Poller } from "@/lib/notifications/poller";

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: "mtd", label: "This month" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "12m", label: "12 months" },
  { value: "all", label: "All time" },
];
// Free-tier friendly: refresh every 60 s, only while this page is on screen, and stop after
// 10 minutes without mouse/keyboard activity (one refresh as soon as someone is back).
const REFRESH_MS = 60000;
const IDLE_MS = 10 * 60 * 1000;
const card = "p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm";

function ago(ms: number, now: number): string {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  return s < 5 ? "just now" : s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`;
}

/** Single-series bar chart with hover tooltip (one hue, no legend - the title names it). */
function BarChart({
  title,
  points,
  value,
  format,
  barClass,
}: {
  title: string;
  points: TrendPoint[];
  value: (p: TrendPoint) => number;
  format: (n: number) => string;
  barClass: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((p) => Math.abs(value(p))));
  const total = points.reduce((s, p) => s + value(p), 0);
  return (
    <div className={card}>
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h3>
        <span className="text-xs font-mono text-neutral-500">Total {format(total)}</span>
      </div>
      {points.length === 0 ? (
        <p className="text-xs text-neutral-500 py-10 text-center">No data in this range.</p>
      ) : (
        <div className="relative">
          <div className="flex items-end h-40 gap-[2px]" onMouseLeave={() => setHover(null)}>
            {points.map((p, i) => {
              const v = value(p);
              return (
                <div key={p.key} className="flex-1 h-full flex items-end" onMouseEnter={() => setHover(i)} aria-label={`${p.key}: ${format(v)}`}>
                  <div
                    className={`w-full rounded-t ${barClass} ${hover === i ? "opacity-100" : "opacity-80"}`}
                    style={{ height: `${v > 0 ? Math.max(3, (v / max) * 100) : 0}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-mono text-neutral-400">
            <span>{points[0]?.key}</span>
            <span>{points[points.length - 1]?.key}</span>
          </div>
          {hover !== null && points[hover] && (
            <div
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full px-2.5 py-1.5 rounded-lg bg-neutral-900 text-white text-[11px] whitespace-nowrap shadow-lg"
              style={{ left: `${((hover + 0.5) / points.length) * 100}%` }}
            >
              <span className="text-neutral-300">{points[hover].key}</span> · <span className="font-bold">{format(value(points[hover]))}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PlatformAnalyticsClient({ initial }: { initial: PlatformAnalytics | null }) {
  const [data, setData] = useState<PlatformAnalytics | null>(initial);
  const [range, setRange] = useState<AnalyticsRange>(initial?.range ?? "30d");
  const [storeId, setStoreId] = useState<string>(initial?.storeId ?? "");
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(initial ? null : "Couldn't load analytics.");
  const [now, setNow] = useState(Date.now());
  const inflight = useRef(0);

  const load = useCallback(async (r: AnalyticsRange, s: string) => {
    const id = ++inflight.current;
    setLoading(true);
    const res = await getPlatformAnalyticsAction(r, s || null).catch(() => ({ ok: false as const, error: "Network error - retrying shortly." }));
    if (id !== inflight.current) return; // a newer request superseded this one
    if (res.ok) {
      setData(res.data);
      setError(null);
    } else setError(res.error);
    setLoading(false);
  }, []);

  // Refresh: on filter change, every 30 s while the tab is visible (paused when hidden, run
  // again on return), never two requests at once - see lib/notifications/poller.ts. The
  // server only re-reads a store's orders/ledger when its fingerprint changed.
  const pollerRef = useRef<Poller | null>(null);
  const skipFirst = useRef(Boolean(initial));
  useEffect(() => {
    const task = async () => {
      // The server already rendered this exact view - don't fetch it again on mount.
      const sameAsInitial = initial && range === initial.range && (storeId || null) === initial.storeId;
      if (skipFirst.current && sameAsInitial) {
        skipFirst.current = false;
        return;
      }
      skipFirst.current = false;
      await load(range, storeId);
    };
    const poller = startPoller(task, REFRESH_MS, undefined, { idleMs: IDLE_MS });
    pollerRef.current = poller;
    return () => {
      poller.stop();
      if (pollerRef.current === poller) pollerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, storeId, load]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  const trendCurrency = data?.totals.find((t) => t.currencyKey === data.trendCurrencyKey)?.currency;
  const trendMoney = (n: number) => formatMoney(n, trendCurrency);

  return (
    <section className="space-y-5" aria-busy={loading}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">Store performance</h2>
          <p className="text-xs text-neutral-500 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${error ? "bg-amber-500" : pollerRef.current?.isIdle() ? "bg-neutral-400" : "bg-emerald-500 animate-pulse"}`} />
            {data
              ? `Updated ${ago(data.generatedAt, now)} · ${pollerRef.current?.isIdle() ? "auto-refresh paused (no activity) - move the mouse or press Refresh" : "refreshes every 60s while this page is open"}`
              : "Loading…"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 p-1 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${range === r.value ? "bg-indigo-600 text-white" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <CustomSelect
            className="w-48"
            value={storeId}
            onChange={setStoreId}
            options={[{ value: "", label: "All stores" }, ...(data?.allStores ?? []).map((s) => ({ value: s.id, label: s.name }))]}
          />
          <button
            type="button"
            onClick={() => (pollerRef.current ? pollerRef.current.trigger() : load(range, storeId))}
            disabled={loading}
            className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          {error}
          {data ? " Showing the last loaded figures." : ""}
        </p>
      )}

      {!data ? (
        <div className={`${card} h-40 animate-pulse`} />
      ) : data.stores.length === 0 ? (
        <div className={`${card} text-center text-sm text-neutral-500`}>No stores yet.</div>
      ) : (
        <div className={`space-y-5 transition-opacity ${loading ? "opacity-70" : ""}`}>
          {data.totals.map((t) => {
            const m = (n: number) => formatMoney(n, t.currency);
            return (
              <div key={t.currencyKey} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  ["Gross revenue", m(t.grossRevenue), "Paid orders, minus reversed payments"],
                  ["Net revenue", m(t.netRevenue), "Gross revenue minus refunds"],
                  ["Refunds", m(t.refunds), "Money returned to customers"],
                  ["Commission earned", m(t.commissionNet), "Charged on paid orders, minus commission returned on refunds/reversals"],
                  ["Outstanding commission", m(t.outstandingCommission), "Estimated: unpaid open/delivered orders × current rate"],
                ].map(([label, value, help]) => (
                  <div key={label} className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80" title={help}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      {label}
                      {data.totals.length > 1 ? ` · ${t.currencyKey}` : ""}
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-neutral-900 dark:text-white font-mono">{value}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{help}</p>
                  </div>
                ))}
              </div>
            );
          })}

          <div className="grid lg:grid-cols-2 gap-5">
            <BarChart
              title={`Net revenue${data.totals.length > 1 && data.trendCurrencyKey ? ` (${data.trendCurrencyKey} stores)` : ""}`}
              points={data.trend}
              value={(p) => p.netRevenue}
              format={trendMoney}
              barClass="bg-indigo-500"
            />
            <BarChart title="New orders" points={data.trend} value={(p) => p.orders} format={(n) => String(n)} barClass="bg-sky-500" />
          </div>

          <div className={`${card} overflow-x-auto`}>
            <table className="w-full text-xs">
              <thead className="text-left text-[10px] uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="py-2 pr-3">Store</th>
                  <th className="py-2 pr-3">Commission rate</th>
                  <th className="py-2 pr-3 text-right">Net revenue</th>
                  <th className="py-2 pr-3 text-right">Commission</th>
                  <th className="py-2 pr-3 text-right">Outstanding</th>
                  <th className="py-2 pr-3 text-right">Orders</th>
                  <th className="py-2 pr-3 text-right">Delivered</th>
                  <th className="py-2 pr-3 text-right">Pending</th>
                  <th className="py-2 text-right">Cancelled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {data.stores.map((s) => {
                  const m = (n: number) => formatMoney(n, s.currency);
                  return (
                    <tr key={s.storeId}>
                      <td className="py-2.5 pr-3">
                        <a href={`/${s.storeId}/edit?tab=Commission`} className="font-bold text-neutral-900 dark:text-white hover:underline">
                          {s.name}
                        </a>
                        {s.status !== "active" && <span className="ml-1.5 text-[10px] text-amber-600">({s.status})</span>}
                      </td>
                      <td className="py-2.5 pr-3 text-neutral-600 dark:text-neutral-300">{s.policy}</td>
                      <td className="py-2.5 pr-3 text-right font-mono font-bold">{m(s.netRevenue)}</td>
                      <td className="py-2.5 pr-3 text-right font-mono">{m(s.commissionNet)}</td>
                      <td className="py-2.5 pr-3 text-right font-mono">{m(s.outstandingCommission)}</td>
                      <td className="py-2.5 pr-3 text-right font-mono">{s.orders}</td>
                      <td className="py-2.5 pr-3 text-right font-mono" title={s.deliveredUnpaid ? `${s.deliveredUnpaid} delivered but not marked paid` : undefined}>
                        {s.deliveredOrders}
                        {s.deliveredUnpaid ? <span className="text-amber-600"> ({s.deliveredUnpaid} unpaid)</span> : null}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono">{s.pendingOrders}</td>
                      <td className="py-2.5 text-right font-mono">{s.cancelledOrders}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-[10px] text-neutral-400 mt-3">
              Revenue counts when an order&apos;s payment is marked paid (not when it&apos;s placed). Order counts are orders placed in the selected range. Each store&apos;s money is shown in its own currency.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
