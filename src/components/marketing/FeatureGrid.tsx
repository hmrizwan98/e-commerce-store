"use client";

import React from "react";
import { motion } from "framer-motion";
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
    <section className="container pb-20 lg:pb-28">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-semibold">Everything you need to run a store</h2>
      </div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
          <motion.div
            key={title}
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.4 }}
            className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
          >
            <Icon className="w-8 h-8 text-primary-6000 mb-4" />
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default React.memo(FeatureGrid);
