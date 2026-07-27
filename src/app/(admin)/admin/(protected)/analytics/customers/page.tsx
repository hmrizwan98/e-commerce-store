import React, { Suspense } from "react";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import DateRangeFilter from "@/components/admin/analytics/DateRangeFilter";
import StatCard from "@/components/admin/analytics/StatCard";
import BreakdownTable from "@/components/admin/analytics/BreakdownTable";
import { resolveDateRange, formatDateRangeLabel } from "@/lib/analytics/date-range";
import { formatCurrency } from "@/lib/analytics/format";
import { getCustomerAnalytics } from "@/lib/firebase/repositories/analytics";

export const dynamic = "force-dynamic";

async function CustomersContent({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  const range = resolveDateRange(searchParams.range, searchParams.from, searchParams.to);
  const customers = await getCustomerAnalytics(range);

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-500">{formatDateRangeLabel(range)}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="New Customers" value={customers.newCustomers} />
        <StatCard label="Returning Customers" value={customers.returningCustomers} />
        <StatCard label="Average Order Value" value={formatCurrency(customers.avgOrderValue)} />
        <StatCard label="Customer Lifetime Value" value={formatCurrency(customers.avgCustomerLifetimeValue)} sublabel="average, all time" />
        <StatCard label="Repeat Purchase Rate" value={`${customers.repeatPurchaseRate}%`} sublabel="all time" />
        <StatCard label="Total Customers" value={customers.totalCustomers} sublabel="all time" />
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Top Spending Customers</h2>
        <BreakdownTable
          columns={["Customer", "Orders", "Total Spent"]}
          rows={customers.topSpenders.map((c) => [c.name || c.email, c.orderCount, formatCurrency(c.totalSpent)])}
        />
      </div>
    </div>
  );
}

export default function AdminAnalyticsCustomersPage({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Customer Analytics</h1>
        <DateRangeFilter />
      </div>
      <AnalyticsNav />
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
        <CustomersContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
