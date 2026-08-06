"use client";

import { motion } from "framer-motion";

const NAV_BAR_WIDTHS = ["70%", "45%", "60%", "40%", "55%"];
const CHART_BAR_HEIGHTS = ["35%", "55%", "40%", "70%", "50%", "85%", "60%", "45%"];
const STAT_TILES = ["Orders", "Revenue", "Customers", "Products"];

/** Abstract, decorative panel mockup - not a real screenshot, so it never
 * misrepresents the actual Store Admin UI. Purely presentational. */
function DashboardPreviewMockup() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
      </div>
      <div className="flex aspect-[16/10]">
        <div className="w-16 sm:w-20 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3 space-y-3">
          <div className="w-6 h-6 rounded-md bg-primary-6000/20" />
          {NAV_BAR_WIDTHS.map((w, i) => (
            <div
              key={i}
              style={{ width: w }}
              className={`h-2 rounded-full ${
                i === 1 ? "bg-primary-6000/60" : "bg-neutral-200 dark:bg-neutral-800"
              }`}
            />
          ))}
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-hidden">
          <div className="grid grid-cols-4 gap-2">
            {STAT_TILES.map((label) => (
              <div
                key={label}
                className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-2"
              >
                <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">{label}</div>
                <div className="mt-1 h-2.5 w-3/4 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 flex-1">
            <div className="flex items-end gap-1.5 h-20">
              {CHART_BAR_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  style={{ height: h }}
                  className={`flex-1 rounded-t-sm ${
                    i === 5 ? "bg-primary-6000" : "bg-primary-6000/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <section className="container py-20 lg:py-28 grid lg:grid-cols-2 gap-10 items-center">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl sm:text-3xl font-semibold">Run your store from one panel</h2>
        <ul className="mt-6 space-y-3 text-neutral-500 dark:text-neutral-400">
          <li>Track orders, revenue, and customers at a glance</li>
          <li>Manage products, inventory, and pricing in real time</li>
          <li>Full CMS, theme, and homepage builder built in</li>
        </ul>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
      >
        <DashboardPreviewMockup />
      </motion.div>
    </section>
  );
}
