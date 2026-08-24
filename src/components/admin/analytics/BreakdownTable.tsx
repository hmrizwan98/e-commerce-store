import React from "react";

export default function BreakdownTable({
  columns,
  rows,
  emptyMessage = "No data for this period yet.",
}: {
  columns: string[];
  rows: React.ReactNode[][];
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-200/80 dark:border-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
            {columns.map((c, idx) => (
              <th key={c} className={`p-3 ${idx === 0 ? "pl-4" : ""} ${idx === columns.length - 1 ? "pr-4" : ""}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`p-3 ${j === 0 ? "pl-4 font-medium text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"} ${j === row.length - 1 ? "pr-4" : ""}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
