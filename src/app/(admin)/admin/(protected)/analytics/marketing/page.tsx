import React, { Suspense } from "react";
import Link from "next/link";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import DateRangeFilter from "@/components/admin/analytics/DateRangeFilter";
import StatCard from "@/components/admin/analytics/StatCard";
import { resolveDateRange, formatDateRangeLabel } from "@/lib/analytics/date-range";
import { getFunnelOverview } from "@/lib/firebase/repositories/analytics";
import { getAnalyticsSettings } from "@/lib/firebase/repositories/site-settings";

export const dynamic = "force-dynamic";

const cardClass = "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6";

function StatusBadge({ configured }: { configured: boolean }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        configured ? "bg-[var(--chart-good)]/10 text-[var(--chart-good)]" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
      }`}
    >
      {configured ? "Ready" : "Not configured"}
    </span>
  );
}

async function MarketingContent({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  const range = resolveDateRange(searchParams.range, searchParams.from, searchParams.to);
  const [funnel, settings] = await Promise.all([getFunnelOverview(range), getAnalyticsSettings()]);
  const { integrations } = settings;

  const rows = [
    { label: "Google Analytics 4", configured: Boolean(integrations.ga4MeasurementId) },
    { label: "Google Tag Manager", configured: Boolean(integrations.gtmContainerId) },
    { label: "Meta Pixel", configured: Boolean(integrations.metaPixelId) },
    { label: "Meta Conversion API", configured: Boolean(integrations.metaConversionApiToken) },
    { label: "TikTok Pixel", configured: Boolean(integrations.tiktokPixelId) },
    { label: "Google Ads Conversion", configured: Boolean(integrations.googleAdsConversionId) },
    { label: "Microsoft Clarity", configured: Boolean(integrations.microsoftClarityId) },
    { label: "Hotjar", configured: Boolean(integrations.hotjarId) },
    { label: "Google Search Console", configured: Boolean(integrations.googleSearchConsoleVerification) },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-500">{formatDateRangeLabel(range)}</p>

      <div className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Integrations</h2>
          <Link href={"/admin/analytics/settings" as any} className="text-sm text-primary-6000 font-medium">
            Configure
          </Link>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-2.5 text-sm">
              <span>{r.label}</span>
              <StatusBadge configured={r.configured} />
            </div>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Conversion funnel (this store&apos;s own tracking)</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Product Views" value={funnel.productViews} />
          <StatCard label="Add To Cart" value={funnel.addToCart} />
          <StatCard label="Checkout Started" value={funnel.checkoutStarted} />
          <StatCard label="Orders" value={funnel.orders} />
          <StatCard label="Conversion Rate" value={`${funnel.conversionRate}%`} />
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsMarketingPage({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Marketing</h1>
        <DateRangeFilter />
      </div>
      <AnalyticsNav />
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
        <MarketingContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
