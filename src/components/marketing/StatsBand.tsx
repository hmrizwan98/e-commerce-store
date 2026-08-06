"use client";

import { motion } from "framer-motion";
import { THEME_PRESETS } from "@/lib/themes/theme-presets";

const STATS: { value: string; label: string }[] = [
  { value: "Multi-tenant", label: "Full data isolation, one platform" },
  { value: String(Object.keys(THEME_PRESETS).length), label: "Production-ready starter themes" },
  { value: "2", label: "Dedicated admin panels: Store Admin & Super Admin" },
  { value: "Commission-based", label: "No flat license fee" },
];

export default function StatsBand() {
  return (
    <section className="border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="container py-14 lg:py-16 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
      >
        {STATS.map((stat) => (
          <div key={stat.label}>
            <div className="text-xl sm:text-2xl font-semibold text-primary-6000">{stat.value}</div>
            <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
