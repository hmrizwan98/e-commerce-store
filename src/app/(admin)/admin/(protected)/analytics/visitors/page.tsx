import React, { Suspense } from "react";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import DateRangeFilter from "@/components/admin/analytics/DateRangeFilter";
import StatCard from "@/components/admin/analytics/StatCard";
import TrendLineChart from "@/components/admin/analytics/TrendLineChart";
import { resolveDateRange, formatDateRangeLabel } from "@/lib/analytics/date-range";
import { formatDuration, formatPercent } from "@/lib/analytics/format";
import { getVisitorOverview, getTrend } from "@/lib/firebase/repositories/analytics";

export const dynamic = "force-dynamic";

async function VisitorsContent({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  const range = resolveDateRange(searchParams.range, searchParams.from, searchParams.to);
  const [overview, trend] = await Promise.all([getVisitorOverview(range), getTrend(range)]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-500">{formatDateRangeLabel(range)}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Visitors" value={overview.totalVisitors} sublabel="total visits, incl. repeats" />
        <StatCard label="Unique Visitors" value={overview.uniqueVisitors} />
        <StatCard label="New Visitors" value={overview.newVisitors} />
        <StatCard label="Returning Visitors" value={overview.returningVisitors} />
        <StatCard label="Sessions" value={overview.sessions} />
        <StatCard label="Page Views" value={overview.pageViews} />
        <StatCard label="Avg. Session Duration" value={formatDuration(overview.avgSessionDurationSeconds)} />
        <StatCard label="Bounce Rate" value={formatPercent(overview.bounceRate)} />
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Visitors &amp; sessions over time</h2>
        <TrendLineChart
          data={trend}
          series={[
            { key: "visitors", label: "Unique visitors", color: "var(--chart-1)" },
            { key: "sessions", label: "Sessions", color: "var(--chart-2)" },
            { key: "pageViews", label: "Page views", color: "var(--chart-3)" },
          ]}
        />
      </div>
    </div>
  );
}

export default function AdminAnalyticsVisitorsPage({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Visitors</h1>
        <DateRangeFilter />
      </div>
      <AnalyticsNav />
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
        <VisitorsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
