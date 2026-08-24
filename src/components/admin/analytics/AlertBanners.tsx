import React from "react";
import { getPreviousPeriod, type DateRangePreset } from "@/lib/analytics/date-range";
import { getVisitorOverview, getFunnelOverview } from "@/lib/firebase/repositories/analytics";
import { getAnalyticsSettings } from "@/lib/firebase/repositories/site-settings";
import { getInventoryProducts } from "@/lib/firebase/repositories/products";

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export default async function AlertBanners({ range }: { range: { start: number; end: number; preset: DateRangePreset } }) {
  const previous = getPreviousPeriod(range);
  const [current, prior, currentFunnel, priorFunnel, settings, inventory] = await Promise.all([
    getVisitorOverview(range),
    getVisitorOverview(previous),
    getFunnelOverview(range),
    getFunnelOverview(previous),
    getAnalyticsSettings(),
    getInventoryProducts(),
  ]);

  const { alerts } = settings;
  const banners: { tone: "good" | "warning" | "critical"; message: string }[] = [];

  const visitorChange = pctChange(current.uniqueVisitors, prior.uniqueVisitors);
  if (visitorChange !== null && visitorChange >= alerts.trafficSpikePercent) {
    banners.push({ tone: "good", message: `Traffic is up ${visitorChange}% vs. the previous period.` });
  }

  const revenueChange = pctChange(currentFunnel.revenue, priorFunnel.revenue);
  if (revenueChange !== null && revenueChange >= alerts.salesSpikePercent) {
    banners.push({ tone: "good", message: `Sales are up ${revenueChange}% vs. the previous period.` });
  }

  const conversionChange = pctChange(currentFunnel.conversionRate, priorFunnel.conversionRate);
  if (conversionChange !== null && conversionChange <= -alerts.conversionDropPercent) {
    banners.push({
      tone: "critical",
      message: `Conversion rate dropped ${Math.abs(conversionChange)}% vs. the previous period.`,
    });
  }

  const lowStock = inventory.filter((p) => p.stock <= (p.lowStockThreshold ?? 5));
  if (lowStock.length) {
    banners.push({ tone: "warning", message: `${lowStock.length} product(s) are low on stock.` });
  }

  if (!banners.length) return null;

  const toneClass: Record<string, string> = {
    good: "border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
    warning: "border-amber-200/80 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
    critical: "border-rose-200/80 dark:border-rose-800/60 bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
  };

  const toneIcon: Record<string, string> = {
    good: "📈",
    warning: "⚠️",
    critical: "📉",
  };

  return (
    <div className="space-y-2">
      {banners.map((b, i) => (
        <div key={i} className={`px-4 py-3 rounded-2xl border text-xs font-semibold backdrop-blur-xl flex items-center gap-2.5 shadow-sm ${toneClass[b.tone]}`}>
          <span>{toneIcon[b.tone]}</span>
          <span>{b.message}</span>
        </div>
      ))}
    </div>
  );
}
