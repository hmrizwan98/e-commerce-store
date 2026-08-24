"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DATE_RANGE_PRESETS } from "@/lib/analytics/date-range";

export default function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("range") ?? "30d";
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  const applyPreset = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    if (value !== "custom") {
      params.delete("from");
      params.delete("to");
    }
    router.push(`${pathname}?${params.toString()}` as any);
  };

  const applyCustom = () => {
    if (!from || !to) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", "custom");
    params.set("from", from);
    params.set("to", to);
    router.push(`${pathname}?${params.toString()}` as any);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-slate-900/5">
        {DATE_RANGE_PRESETS.filter((p) => p.value !== "custom").map((p) => (
          <button
            key={p.value}
            onClick={() => applyPreset(p.value)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
              current === p.value
                ? "bg-primary-6000 text-white shadow-md shadow-primary-500/25 scale-[1.02]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-1 rounded-2xl shadow-md shadow-slate-900/5">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="px-2.5 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <span className="text-slate-400 text-xs">–</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="px-2.5 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          onClick={applyCustom}
          className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
            current === "custom"
              ? "bg-primary-6000 text-white shadow-md shadow-primary-500/25"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
