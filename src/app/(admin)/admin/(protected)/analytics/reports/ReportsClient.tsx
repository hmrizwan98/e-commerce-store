"use client";

import { useEffect, useState } from "react";
import { fetchReportData } from "./actions";
import { exportCsv, exportExcel } from "@/lib/analytics/export";
import BreakdownTable from "@/components/admin/analytics/BreakdownTable";
import type { DateRange } from "@/lib/firebase/repositories/analytics";

const cardClass = "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6";

export default function ReportsClient({ range }: { range: DateRange }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchReportData>> | null>(null);

  useEffect(() => {
    setData(null);
    fetchReportData(range).then(setData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.start, range.end]);

  if (!data) return <p className="text-sm text-neutral-500">Loading report…</p>;

  const summaryHeaders = ["Metric", "Value"];
  const summaryRows: (string | number)[][] = [
    ["Total Visitors", data.visitors.totalVisitors],
    ["Unique Visitors", data.visitors.uniqueVisitors],
    ["Returning Visitors", data.visitors.returningVisitors],
    ["Sessions", data.visitors.sessions],
    ["Page Views", data.visitors.pageViews],
    ["Bounce Rate (%)", data.visitors.bounceRate],
    ["Avg Session Duration (s)", data.visitors.avgSessionDurationSeconds],
    ["Product Views", data.funnel.productViews],
    ["Product Clicks", data.funnel.productClicks],
    ["Add To Cart", data.funnel.addToCart],
    ["Checkout Started", data.funnel.checkoutStarted],
    ["Orders", data.sales.orders],
    ["Revenue ($)", data.sales.revenue],
    ["Tax ($)", data.sales.tax],
    ["Shipping ($)", data.sales.shipping],
    ["Refunds ($)", data.sales.refunds],
    ["Avg Order Value ($)", data.sales.avgOrderValue],
    ["Avg Basket Size", data.sales.avgBasketSize],
    ["Conversion Rate (%)", data.funnel.conversionRate],
    ["Wishlist Adds", data.funnel.wishlistAdds],
    ["Compare Adds", data.funnel.compareAdds],
    ["Search Count", data.funnel.searchCount],
    ["Newsletter Signups", data.funnel.newsletterSignups],
  ];

  const trendHeaders = ["Date", "Visitors", "Sessions", "Page Views", "Orders", "Revenue"];
  const trendRows = data.trend.map((t) => [t.date, t.visitors, t.sessions, t.pageViews, t.orders, t.revenue]);

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-wrap gap-3 print:hidden">
        <button
          onClick={() => exportCsv("analytics-summary", summaryHeaders, summaryRows)}
          className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
        >
          Export Summary (CSV)
        </button>
        <button
          onClick={() => exportExcel("analytics-summary", "Summary", summaryHeaders, summaryRows)}
          className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
        >
          Export Summary (Excel)
        </button>
        <button
          onClick={() => exportCsv("analytics-daily-trend", trendHeaders, trendRows)}
          className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
        >
          Export Daily Trend (CSV)
        </button>
        <button
          onClick={() => exportExcel("analytics-daily-trend", "Daily Trend", trendHeaders, trendRows)}
          className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
        >
          Export Daily Trend (Excel)
        </button>
        <button onClick={() => window.print()} className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium">
          Print / Save as PDF
        </button>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Summary</h2>
        <BreakdownTable columns={summaryHeaders} rows={summaryRows} />
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Daily Trend</h2>
        <BreakdownTable columns={trendHeaders} rows={trendRows} />
      </div>
    </div>
  );
}
