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
    <div className="flex flex-wrap gap-1 border-b border-neutral-200 dark:border-neutral-800 pb-px overflow-x-auto">
      {TABS.map((tab) => {
        const active = tab.href === "/admin/analytics" ? pathname === tab.href : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href as any}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${
              active
                ? "border-primary-6000 text-primary-6000"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
