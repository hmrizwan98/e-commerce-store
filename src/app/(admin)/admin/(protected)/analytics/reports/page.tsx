import React from "react";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import DateRangeFilter from "@/components/admin/analytics/DateRangeFilter";
import ReportsClient from "./ReportsClient";
import { resolveDateRange, formatDateRangeLabel } from "@/lib/analytics/date-range";

export default function AdminAnalyticsReportsPage({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  const range = resolveDateRange(searchParams.range, searchParams.from, searchParams.to);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <DateRangeFilter />
      </div>
      <div className="print:hidden">
        <AnalyticsNav />
      </div>
      <p className="text-sm text-neutral-500">{formatDateRangeLabel(range)}</p>
      <ReportsClient range={{ start: range.start, end: range.end }} />
    </div>
  );
}
