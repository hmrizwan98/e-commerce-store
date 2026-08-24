import React from "react";

export interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
}

export default function StatCard({ label, value, sublabel }: StatCardProps) {
  const isLive = sublabel === "live";

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all group relative overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
        {isLive && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {value}
      </p>
      {sublabel && !isLive && (
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">{sublabel}</p>
      )}
    </div>
  );
}
