import React, { Suspense } from "react";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import DateRangeFilter from "@/components/admin/analytics/DateRangeFilter";
import StatCard from "@/components/admin/analytics/StatCard";
import TrendLineChart from "@/components/admin/analytics/TrendLineChart";
import { resolveDateRange, formatDateRangeLabel } from "@/lib/analytics/date-range";
import { formatCurrency } from "@/lib/analytics/format";
import { getSalesOverview, getFunnelOverview, getTrend } from "@/lib/firebase/repositories/analytics";

export const dynamic = "force-dynamic";

async function SalesContent({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  const range = resolveDateRange(searchParams.range, searchParams.from, searchParams.to);
  const [sales, funnel, trend] = await Promise.all([
    getSalesOverview(range),
    getFunnelOverview(range),
    getTrend(range),
  ]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-500">{formatDateRangeLabel(range)}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={formatCurrency(sales.revenue)} />
        <StatCard label="Orders" value={sales.orders} />
        <StatCard label="Taxes" value={formatCurrency(sales.tax)} />
        <StatCard label="Shipping" value={formatCurrency(sales.shipping)} />
        <StatCard label="Refunds" value={formatCurrency(sales.refunds)} />
        <StatCard label="Average Order Value" value={formatCurrency(sales.avgOrderValue)} />
        <StatCard label="Average Basket Size" value={`${sales.avgBasketSize} items`} />
        <StatCard label="Conversion Rate" value={`${funnel.conversionRate}%`} />
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Revenue &amp; orders over time</h2>
        <TrendLineChart
          data={trend}
          series={[
            { key: "revenue", label: "Revenue ($)", color: "var(--chart-4)" },
            { key: "orders", label: "Orders", color: "var(--chart-6)" },
          ]}
        />
      </div>
    </div>
  );
}

export default function AdminAnalyticsSalesPage({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Sales Analytics</h1>
        <DateRangeFilter />
      </div>
      <AnalyticsNav />
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
        <SalesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
