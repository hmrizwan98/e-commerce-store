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
    title: "Store Admin, built for daily operations",
    description:
      "Products, inventory, orders, customers, finance, and a full CMS/Theme/Homepage builder - everything a store owner needs in one panel.",
  },
  {
    icon: UserGroupIcon,
    title: "Super Admin for platform operators",
    description:
      "Provision new stores, manage domains, monitor every tenant, and oversee platform-wide revenue and payouts from a single control plane.",
  },
  {
    icon: CloudIcon,
    title: "Fast, reliable hosting",
    description:
      "Built on Next.js Server Components with per-request rendering - your storefront stays fast without you managing any infrastructure.",
  },
  {
    icon: PhotoIcon,
    title: "Cloudinary-powered media",
    description:
      "Every product photo, banner, and theme asset is automatically optimized and delivered through Cloudinary - no manual image work required.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Enterprise-grade security",
    description:
      "Role-based access for Store Admins and Super Admins, tenant isolation enforced at the data layer, and a full audit trail on every sensitive action.",
  },
  {
    icon: BoltIcon,
    title: "Optimized for performance",
    description:
      "Indexed queries, computed-not-duplicated analytics, and server-rendered pages keep every store fast as it grows.",
  },
  {
    icon: BanknotesIcon,
    title: "Commission-based, aligned with your growth",
    description:
      "No flat license fee locking you in - our commission model means we succeed only when your store sells.",
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

