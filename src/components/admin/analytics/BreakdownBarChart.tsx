"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CHART_COLORS } from "@/lib/analytics/chart-colors";

export default function BreakdownBarChart({ data }: { data: { label: string; count: number }[] }) {
  if (!data.length) {
    return <p className="text-sm text-neutral-500 py-8 text-center">No data for this period yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid stroke="var(--chart-grid)" horizontal={false} />
        <XAxis type="number" stroke="var(--chart-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          stroke="var(--chart-muted)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={140}
        />
        <Tooltip
          contentStyle={{
            background: "var(--chart-surface)",
            border: "1px solid var(--chart-grid)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
