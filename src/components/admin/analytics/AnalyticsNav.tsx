"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/analytics", label: "Overview" },
  { href: "/admin/analytics/visitors", label: "Visitors" },
  { href: "/admin/analytics/sales", label: "Sales" },
  { href: "/admin/analytics/products", label: "Products" },
  { href: "/admin/analytics/customers", label: "Customers" },
  { href: "/admin/analytics/marketing", label: "Marketing" },
  { href: "/admin/analytics/traffic", label: "Traffic" },
  { href: "/admin/analytics/devices", label: "Devices" },
  { href: "/admin/analytics/locations", label: "Locations" },
  { href: "/admin/analytics/realtime", label: "Realtime" },
  { href: "/admin/analytics/reports", label: "Reports" },
  { href: "/admin/analytics/settings", label: "Settings" },
];

export default function AnalyticsNav() {
  const pathname = usePathname();
  return (
    <div className="p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1 overflow-x-auto no-scrollbar shadow-inner">
      {TABS.map((tab) => {
        const active = tab.href === "/admin/analytics" ? pathname === tab.href : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href as any}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              active
                ? "bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-md shadow-slate-900/5 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-700/40"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
