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
      {DATE_RANGE_PRESETS.filter((p) => p.value !== "custom").map((p) => (
        <button
          key={p.value}
          onClick={() => applyPreset(p.value)}
          className={`px-3 py-1.5 text-sm rounded-full border whitespace-nowrap ${
            current === p.value
              ? "bg-primary-6000 text-white border-primary-6000"
              : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          {p.label}
        </button>
      ))}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="px-2 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
        />
        <span className="text-neutral-400">–</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="px-2 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
        />
        <button
          onClick={applyCustom}
          className={`px-3 py-1.5 text-sm rounded-full border whitespace-nowrap ${
            current === "custom"
              ? "bg-primary-6000 text-white border-primary-6000"
              : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
