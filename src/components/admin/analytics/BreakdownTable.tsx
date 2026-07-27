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
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
            {columns.map((c) => (
              <th key={c} className="p-3">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-neutral-100 dark:border-neutral-800/60">
              {row.map((cell, j) => (
                <td key={j} className="p-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={columns.length} className="p-6 text-center text-neutral-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
