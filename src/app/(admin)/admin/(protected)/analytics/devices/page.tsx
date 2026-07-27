import React, { Suspense } from "react";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import DateRangeFilter from "@/components/admin/analytics/DateRangeFilter";
import BreakdownBarChart from "@/components/admin/analytics/BreakdownBarChart";
import { resolveDateRange, formatDateRangeLabel } from "@/lib/analytics/date-range";
import { getDeviceBreakdown } from "@/lib/firebase/repositories/analytics";

export const dynamic = "force-dynamic";

const cardClass = "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6";

async function DevicesContent({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  const range = resolveDateRange(searchParams.range, searchParams.from, searchParams.to);
  const breakdown = await getDeviceBreakdown(range);

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-500">{formatDateRangeLabel(range)}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardClass}>
          <h2 className="font-semibold mb-4">Device Type</h2>
          <BreakdownBarChart data={breakdown.devices} />
        </div>
        <div className={cardClass}>
          <h2 className="font-semibold mb-4">Browsers</h2>
          <BreakdownBarChart data={breakdown.browsers} />
        </div>
        <div className={cardClass}>
          <h2 className="font-semibold mb-4">Operating Systems</h2>
          <BreakdownBarChart data={breakdown.operatingSystems} />
        </div>
        <div className={cardClass}>
          <h2 className="font-semibold mb-4">Screen Sizes</h2>
          <BreakdownBarChart data={breakdown.screenSizes} />
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsDevicesPage({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Device Analytics</h1>
        <DateRangeFilter />
      </div>
      <AnalyticsNav />
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
        <DevicesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
