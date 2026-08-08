import React from "react";
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UsersIcon,
  BanknotesIcon,
  CheckCircleIcon,
  SparklesIcon,
  CloudIcon,
} from "@heroicons/react/24/outline";

function DashboardPreviewMockup() {
  return (
    <div
      aria-hidden="true"
      className="relative rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 shadow-2xl shadow-neutral-900/10 dark:shadow-neutral-950/50 overflow-hidden"
    >
      {/* Window Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400/80" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80" />
            <span className="w-3 h-3 rounded-full bg-green-400/80" />
          </div>
          <div className="ml-3 px-3 py-1 rounded-md bg-neutral-200/60 dark:bg-neutral-800/60 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            store-admin.tradezglint.com
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary-6000/10 text-primary-6000 border border-primary-6000/20">
            Tenant Isolated
          </span>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="p-5 space-y-5 bg-neutral-50/30 dark:bg-neutral-900/40">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
              <span>Gross Revenue</span>
              <BanknotesIcon className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-bold text-neutral-900 dark:text-white font-mono">$48,250</div>
            <div className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">+14.2% this month</div>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
              <span>Total Orders</span>
              <ShoppingBagIcon className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-bold text-neutral-900 dark:text-white font-mono">1,420</div>
            <div className="mt-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">98.4% fulfilled</div>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
              <span>Customers</span>
              <UsersIcon className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-bold text-neutral-900 dark:text-white font-mono">892</div>
            <div className="mt-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">340 repeat buyers</div>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
              <span>Cloudinary CDN</span>
              <CloudIcon className="w-4 h-4 text-primary-6000" />
            </div>
            <div className="mt-2 text-lg sm:text-xl font-bold text-neutral-900 dark:text-white font-mono">Auto-Optimized</div>
            <div className="mt-1 text-[11px] font-semibold text-primary-6000">100% WebP delivery</div>
          </div>
        </div>

        {/* Visual Chart & Orders Preview */}
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <span className="flex items-center gap-1.5">
                <ChartBarIcon className="w-4 h-4 text-primary-6000" /> Revenue & Orders Growth
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">Real-time telemetry</span>
            </div>
            {/* Chart Graphic */}
            <div className="flex items-end gap-2 h-28 pt-2 px-1">
              {[40, 65, 50, 85, 70, 95, 80, 100].map((h, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    style={{ height: `${h}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      idx >= 5
                        ? "bg-gradient-to-t from-primary-6000 to-indigo-500 shadow-sm shadow-primary-6000/30"
                        : "bg-primary-6000/20 dark:bg-primary-6000/30"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <span className="flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-amber-500" /> Active Theme Preset
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-xs space-y-1.5 border border-neutral-200/60 dark:border-neutral-800/60">
              <div className="font-semibold text-neutral-900 dark:text-white flex items-center justify-between">
                <span>Modern Minimalist</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-neutral-500 text-[11px]">Primary: #2563eb · Body: Inter</p>
            </div>
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Homepage Builder</span>
              <span className="font-semibold text-primary-6000">12 Sections Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <section className="relative container py-20 lg:py-28">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Store Admin & Super Admin Control
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
            Run your store from one dedicated panel
          </h2>
          <p className="text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Every store owner gets a dedicated, tenant-isolated Store Admin panel for day-to-day operations, paired with Super Admin control for platform operators.
          </p>
          <ul className="space-y-3.5 text-sm text-neutral-700 dark:text-neutral-300">
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Real-time order tracking, financial ledgers, customer lifetime analytics</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Catalog management with variants, SKUs, inventory alerts and collections</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Drag-and-configure Homepage Builder & full custom page CMS</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Cloudinary-powered media upload pipeline with auto WebP optimization</span>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-7">
          <DashboardPreviewMockup />
        </div>
      </div>
    </section>
  );
}

