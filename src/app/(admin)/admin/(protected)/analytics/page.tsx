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
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Visitors</h2>
          <TrendLineChart
            data={trend}
            series={[
              { key: "visitors", label: "Unique visitors", color: "var(--chart-1)" },
              { key: "sessions", label: "Sessions", color: "var(--chart-2)" },
            ]}
          />
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Revenue &amp; Orders</h2>
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
        <h1 className="text-2xl font-semibold">Analytics Overview</h1>
        <DateRangeFilter />
      </div>
      <AnalyticsNav />
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
        <OverviewContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
