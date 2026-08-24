import React, { Suspense } from "react";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import DateRangeFilter from "@/components/admin/analytics/DateRangeFilter";
import StatCard from "@/components/admin/analytics/StatCard";
import TrendLineChart from "@/components/admin/analytics/TrendLineChart";
import AlertBanners from "@/components/admin/analytics/AlertBanners";
import { resolveDateRange, formatDateRangeLabel } from "@/lib/analytics/date-range";
import { formatDuration, formatCurrency, formatPercent } from "@/lib/analytics/format";
import {
  getVisitorOverview,
  getFunnelOverview,
  getTrend,
  getActiveUserCount,
  getNewsletterSubscriberCount,
} from "@/lib/firebase/repositories/analytics";

export const dynamic = "force-dynamic";

async function OverviewContent({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  const range = resolveDateRange(searchParams.range, searchParams.from, searchParams.to);

  const [visitors, funnel, trend, activeUsers, newsletterSubscribers] = await Promise.all([
    getVisitorOverview(range),
    getFunnelOverview(range),
    getTrend(range),
    getActiveUserCount(),
    getNewsletterSubscriberCount(),
  ]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-500">{formatDateRangeLabel(range)}</p>

      <AlertBanners range={range} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Visitors" value={visitors.totalVisitors} />
        <StatCard label="Unique Visitors" value={visitors.uniqueVisitors} />
        <StatCard label="Returning Visitors" value={visitors.returningVisitors} />
        <StatCard label="Active Users Right Now" value={activeUsers} sublabel="live" />
        <StatCard label="Page Views" value={visitors.pageViews} />
        <StatCard label="Sessions" value={visitors.sessions} />
        <StatCard label="Avg. Session Duration" value={formatDuration(visitors.avgSessionDurationSeconds)} />
        <StatCard label="Bounce Rate" value={formatPercent(visitors.bounceRate)} />
        <StatCard label="Products Viewed" value={funnel.productViews} />
        <StatCard label="Product Clicks" value={funnel.productClicks} />
        <StatCard label="Add To Cart" value={funnel.addToCart} />
        <StatCard label="Checkout Started" value={funnel.checkoutStarted} />
        <StatCard label="Orders" value={funnel.orders} />
        <StatCard label="Revenue" value={formatCurrency(funnel.revenue)} />
        <StatCard label="Conversion Rate" value={formatPercent(funnel.conversionRate)} />
        <StatCard label="Wishlist Adds" value={funnel.wishlistAdds} />
        <StatCard label="Compare Adds" value={funnel.compareAdds} />
        <StatCard label="Search Count" value={funnel.searchCount} />
        <StatCard label="Newsletter Subscribers" value={newsletterSubscribers} sublabel="all time" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl shadow-slate-900/5 space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>Visitors Trend</span>
            <span className="text-xs font-normal text-slate-400">Unique visitors vs sessions</span>
          </h2>
          <TrendLineChart
            data={trend}
            series={[
              { key: "visitors", label: "Unique visitors", color: "var(--chart-1)" },
              { key: "sessions", label: "Sessions", color: "var(--chart-2)" },
            ]}
          />
        </div>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl shadow-slate-900/5 space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>Revenue &amp; Orders Trend</span>
            <span className="text-xs font-normal text-slate-400">Financial performance</span>
          </h2>
          <TrendLineChart
            data={trend}
            series={[
              { key: "revenue", label: "Revenue ($)", color: "var(--chart-4)" },
              { key: "orders", label: "Orders", color: "var(--chart-6)" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsOverviewPage({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-wider mb-2">
            📊 Performance Insights
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Analytics Overview
          </h1>
        </div>
        <DateRangeFilter />
      </div>
      <AnalyticsNav />
      <Suspense fallback={<p className="text-sm text-slate-500 py-6 text-center">Loading analytics data…</p>}>
        <OverviewContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
