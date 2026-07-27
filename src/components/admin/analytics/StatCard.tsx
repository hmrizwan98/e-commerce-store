import React from "react";

export interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
}

export default function StatCard({ label, value, sublabel }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="text-2xl font-semibold mt-2 tabular-nums">{value}</p>
      {sublabel && <p className="text-xs text-neutral-400 mt-1">{sublabel}</p>}
    </div>
  );
}
