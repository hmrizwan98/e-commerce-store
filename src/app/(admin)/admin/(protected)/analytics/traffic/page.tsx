import React, { Suspense } from "react";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import DateRangeFilter from "@/components/admin/analytics/DateRangeFilter";
import BreakdownBarChart from "@/components/admin/analytics/BreakdownBarChart";
import BreakdownTable from "@/components/admin/analytics/BreakdownTable";
import { resolveDateRange, formatDateRangeLabel } from "@/lib/analytics/date-range";
import { getTrafficSources, getSeoAnalytics } from "@/lib/firebase/repositories/analytics";

export const dynamic = "force-dynamic";

const cardClass = "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6";

async function TrafficContent({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  const range = resolveDateRange(searchParams.range, searchParams.from, searchParams.to);
  const [sources, seo] = await Promise.all([getTrafficSources(range), getSeoAnalytics(range)]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-500">{formatDateRangeLabel(range)}</p>

      <div className={cardClass}>
        <h2 className="font-semibold mb-1">Traffic Sources</h2>
        <p className="text-xs text-neutral-500 mb-4">
          Organic Search / social platforms are detected from the referrer; Email and Paid Ads are detected from
          <code className="mx-1">utm_source</code>/<code>utm_medium</code> on the landing link.
        </p>
        <BreakdownBarChart data={sources} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardClass}>
          <h2 className="font-semibold mb-4">Top Landing Pages</h2>
          <BreakdownTable columns={["Page", "Sessions"]} rows={seo.topLandingPages.map((p) => [p.label, p.count])} />
        </div>
        <div className={cardClass}>
          <h2 className="font-semibold mb-4">Top Exit Pages</h2>
          <BreakdownTable columns={["Page", "Sessions"]} rows={seo.topExitPages.map((p) => [p.label, p.count])} />
        </div>
        <div className={cardClass}>
          <h2 className="font-semibold mb-4">Internal Search Queries</h2>
          <BreakdownTable columns={["Query", "Count"]} rows={seo.topSearchQueries.map((p) => [p.label, p.count])} />
        </div>
        <div className={cardClass}>
          <h2 className="font-semibold mb-4">404 Pages</h2>
          <BreakdownTable columns={["Path", "Hits"]} rows={seo.notFoundPages.map((p) => [p.label, p.count])} />
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsTrafficPage({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Traffic &amp; SEO</h1>
        <DateRangeFilter />
      </div>
      <AnalyticsNav />
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
        <TrafficContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
