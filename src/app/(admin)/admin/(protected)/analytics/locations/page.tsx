import React, { Suspense } from "react";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import DateRangeFilter from "@/components/admin/analytics/DateRangeFilter";
import BreakdownBarChart from "@/components/admin/analytics/BreakdownBarChart";
import { resolveDateRange, formatDateRangeLabel } from "@/lib/analytics/date-range";
import { getLocationBreakdown } from "@/lib/firebase/repositories/analytics";

export const dynamic = "force-dynamic";

const cardClass = "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6";

async function LocationsContent({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  const range = resolveDateRange(searchParams.range, searchParams.from, searchParams.to);
  const breakdown = await getLocationBreakdown(range);

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-500">{formatDateRangeLabel(range)}</p>

      <div className="p-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-sm text-neutral-500">
        Country/city/region require an IP-geolocation provider, which isn&apos;t configured for this store yet - they
        show as &quot;Unknown&quot; below. Language and timezone are real, captured directly from each visitor&apos;s
        browser.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardClass}>
          <h2 className="font-semibold mb-4">Countries</h2>
          <BreakdownBarChart data={breakdown.countries} />
        </div>
        <div className={cardClass}>
          <h2 className="font-semibold mb-4">Cities</h2>
          <BreakdownBarChart data={breakdown.cities} />
        </div>
        <div className={cardClass}>
          <h2 className="font-semibold mb-4">Regions</h2>
          <BreakdownBarChart data={breakdown.regions} />
        </div>
        <div className={cardClass}>
          <h2 className="font-semibold mb-4">Languages</h2>
          <BreakdownBarChart data={breakdown.languages} />
        </div>
        <div className={cardClass}>
          <h2 className="font-semibold mb-4">Timezones</h2>
          <BreakdownBarChart data={breakdown.timezones} />
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsLocationsPage({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Geo Analytics</h1>
        <DateRangeFilter />
      </div>
      <AnalyticsNav />
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
        <LocationsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
