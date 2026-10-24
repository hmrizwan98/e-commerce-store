import React from "react";
import { THEME_PRESETS } from "@/lib/themes/theme-presets";

const STATS: { value: string; label: string; sub?: string }[] = [
  { value: "6+", label: "Pakistani Couriers", sub: "Tracking links for every order" },
  { value: String(Object.keys(THEME_PRESETS).length), label: "Ready-made Themes", sub: "Included from day one" },
  { value: "3", label: "Local Payment Options", sub: "COD, bank transfer & JazzCash / EasyPaisa" },
  { value: "Rs 0", label: "Monthly Fee", sub: "Small commission only when you sell" },
];

export default function StatsBand() {
  return (
    <section className="relative border-y border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-900 text-white overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-6000/20 via-neutral-900 to-neutral-950 pointer-events-none" />

      <div className="container relative py-12 lg:py-16 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x-0 lg:divide-x divide-neutral-800">
        {STATS.map((stat) => (
          <div key={stat.label} className="px-4 space-y-1.5">
            <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-300 font-mono tracking-tight">
              {stat.value}
            </div>
            <div className="text-sm font-bold text-primary-400 tracking-wide">{stat.label}</div>
            <div className="text-xs text-neutral-400 font-medium">{stat.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

