import React, { Suspense } from "react";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import DateRangeFilter from "@/components/admin/analytics/DateRangeFilter";
import BreakdownTable from "@/components/admin/analytics/BreakdownTable";
import BreakdownBarChart from "@/components/admin/analytics/BreakdownBarChart";
import { resolveDateRange, formatDateRangeLabel } from "@/lib/analytics/date-range";
import { formatCurrency } from "@/lib/analytics/format";
import {
  getMostViewedProducts,
  getMostPurchasedProducts,
  getHighestRevenueProducts,
  getMostAddedToCartProducts,
  getMostWishlistedProducts,
  getMostComparedProducts,
  getCatalogHealth,
  getTopCategories,
  getTopBrands,
  type ProductStat,
} from "@/lib/firebase/repositories/analytics";

export const dynamic = "force-dynamic";

const cardClass = "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6";

function ProductStatTable({ title, stats, showRevenue }: { title: string; stats: ProductStat[]; showRevenue?: boolean }) {
  return (
    <div className={cardClass}>
      <h2 className="font-semibold mb-4">{title}</h2>
      <BreakdownTable
        columns={showRevenue ? ["Product", "Count", "Revenue"] : ["Product", "Count"]}
        rows={stats.map((s) =>
          showRevenue ? [s.name, s.count, formatCurrency(s.revenue ?? 0)] : [s.name, s.count]
        )}
      />
    </div>
  );
}

async function ProductsContent({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  const range = resolveDateRange(searchParams.range, searchParams.from, searchParams.to);
  const [
    mostViewed,
    mostPurchased,
    highestRevenue,
    mostAddedToCart,
    mostWishlisted,
    mostCompared,
    catalogHealth,
    topCategories,
    topBrands,
  ] = await Promise.all([
    getMostViewedProducts(range),
    getMostPurchasedProducts(range),
    getHighestRevenueProducts(range),
    getMostAddedToCartProducts(range),
    getMostWishlistedProducts(range),
    getMostComparedProducts(range),
    getCatalogHealth(),
    getTopCategories(range),
    getTopBrands(range),
  ]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-500">{formatDateRangeLabel(range)}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductStatTable title="Most Viewed Products" stats={mostViewed} />
        <ProductStatTable title="Most Purchased Products" stats={mostPurchased} />
        <ProductStatTable title="Highest Revenue Products" stats={highestRevenue} showRevenue />
        <ProductStatTable title="Most Added To Cart" stats={mostAddedToCart} />
        <ProductStatTable title="Most Wishlisted Products" stats={mostWishlisted} />
        <ProductStatTable title="Most Compared Products" stats={mostCompared} />

        <div className={cardClass}>
          <h2 className="font-semibold mb-4">Top Categories</h2>
          <BreakdownBarChart data={topCategories} />
        </div>
        <div className={cardClass}>
          <h2 className="font-semibold mb-4">Top Brands</h2>
          <BreakdownBarChart data={topBrands} />
        </div>

        <div className={cardClass}>
          <h2 className="font-semibold mb-1">Products Never Viewed</h2>
          <p className="text-sm text-neutral-500 mb-4">{catalogHealth.neverViewedCount} active products, all time</p>
          <BreakdownTable
            columns={["Product"]}
            rows={catalogHealth.neverViewedProducts.map((p) => [p.name])}
            emptyMessage="Every active product has been viewed at least once."
          />
        </div>
        <div className={cardClass}>
          <h2 className="font-semibold mb-1">Products Never Purchased</h2>
          <p className="text-sm text-neutral-500 mb-4">{catalogHealth.neverPurchasedCount} active products, all time</p>
          <BreakdownTable
            columns={["Product"]}
            rows={catalogHealth.neverPurchasedProducts.map((p) => [p.name])}
            emptyMessage="Every active product has sold at least once."
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsProductsPage({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Product Analytics</h1>
        <DateRangeFilter />
      </div>
      <AnalyticsNav />
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
