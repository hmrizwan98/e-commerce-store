"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export interface TrendSeries {
  key: string;
  label: string;
  color: string;
}

export default function TrendLineChart({
  data,
  series,
  xKey = "date",
}: {
  data: any[];
  series: TrendSeries[];
  xKey?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
        <XAxis dataKey={xKey} stroke="var(--chart-muted)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--chart-muted)" fontSize={12} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          contentStyle={{
            background: "var(--chart-surface)",
            border: "1px solid var(--chart-grid)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
