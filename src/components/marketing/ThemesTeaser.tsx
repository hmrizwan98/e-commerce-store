"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { THEME_PRESETS } from "@/lib/themes/theme-presets";

const FALLBACK_SWATCHES = ["#2563eb", "#0f172a", "#06b6d4"];

function ThemesTeaser() {
  const presets = Object.values(THEME_PRESETS);

  return (
    <section className="container py-20 lg:py-28">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-semibold">Four themes, ready on day one</h2>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          Every store starts from a complete, production-ready theme - colors, typography, and homepage layout
          included.
        </p>
      </div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {presets.map((preset) => {
          const swatches = [
            preset.theme.colors?.primary,
            preset.theme.colors?.secondary,
            preset.theme.colors?.accent,
          ].filter(Boolean) as string[];
          const colors = swatches.length ? swatches : FALLBACK_SWATCHES;

          return (
            <motion.div
              key={preset.key}
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4 }}
              className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
            >
              <div className="flex gap-1.5 mb-4">
                {colors.map((color, i) => (
                  <span key={i} className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: color }} />
                ))}
              </div>
              <h3 className="font-semibold">{preset.name}</h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{preset.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
      <div className="text-center mt-10">
        <Link href={"/themes" as any} className="font-medium text-primary-6000 hover:underline">
          Explore all themes →
        </Link>
      </div>
    </section>
  );
}

export default React.memo(ThemesTeaser);
