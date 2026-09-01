import React from "react";
import {
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  BoltIcon,
  CloudIcon,
  PhotoIcon,
  BanknotesIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export interface Highlight {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const HIGHLIGHTS: Highlight[] = [
  {
    icon: BuildingStorefrontIcon,
    title: "True multi-tenant architecture",
    description:
      "Every store's data is fully isolated under its own tenant boundary - your store, your customers, your orders, never mixed with anyone else's.",
  },
  {
    icon: Cog6ToothIcon,
    title: "Native Pakistani Couriers (`/order-tracking`)",
    description:
      "Integrated live order tracking for Couriers Next, TCS, PostEx, Trax, Leopards & CallCourier with visual step timeline.",
  },
  {
    icon: UserGroupIcon,
    title: "Super Admin Control & Impersonation",
    description:
      "1-click store creation wizard, store cloning, and secure 1-click Store Owner impersonation with instant return.",
  },
  {
    icon: CloudIcon,
    title: "WhatsApp Order Updates & Chat",
    description:
      "Automated WhatsApp tracking link sharing, WhatsApp chat float button, and direct customer notification pre-fills.",
  },
  {
    icon: PhotoIcon,
    title: "Cloudinary-powered media",
    description:
      "Every product photo, banner, and theme asset is automatically optimized and delivered through Cloudinary CDN.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Enterprise-grade security",
    description:
      "Role-based access for Store Admins and Super Admins, tenant isolation enforced at data layer, and full audit logs.",
  },
  {
    icon: BoltIcon,
    title: "Next.js 14 App Router speed",
    description:
      "Server-rendered pages, instant URL search filter state, and computed analytics keep every storefront fast as it grows.",
  },
  {
    icon: BanknotesIcon,
    title: "0% Hidden Transaction Fees",
    description:
      "No hidden commissions or forced app subscriptions locking you in — keep 100% of your store sales profits.",
  },
];

function FeatureGrid() {
  return (
    <section className="container py-20 lg:py-28">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Everything you need to run a serious store
        </h2>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
          Built from the ground up to give store owners full operational autonomy and platform operators total control.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="group relative p-6 sm:p-7 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm hover:border-primary-6000/40 hover:shadow-xl hover:shadow-primary-6000/5 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary-6000/10 dark:bg-primary-6000/20 text-primary-6000 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary-6000 group-hover:text-white transition-all">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2 tracking-tight">{title}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default React.memo(FeatureGrid);

