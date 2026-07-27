"use client";

import { useEffect, useState } from "react";
import BreakdownTable from "@/components/admin/analytics/BreakdownTable";
import { fetchRealtimeSessions } from "./actions";
import type { RealtimeSession } from "@/lib/firebase/repositories/analytics";

const cardClass = "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6";

export default function RealtimeClient() {
  const [sessions, setSessions] = useState<RealtimeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const result = await fetchRealtimeSessions();
      if (!cancelled) {
        setSessions(result);
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const activeUsers = new Set(sessions.map((s) => s.visitorId)).size;

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <p className="text-sm text-neutral-500">Active users right now</p>
        <p className="text-4xl font-semibold mt-2 tabular-nums">{loading ? "…" : activeUsers}</p>
        <p className="text-xs text-neutral-400 mt-1">Updates every 10 seconds &middot; active in the last 60 seconds</p>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Active sessions</h2>
        <BreakdownTable
          columns={["Page", "Country", "Device", "Browser", "OS", "Referrer"]}
          rows={sessions.map((s) => [
            s.path,
            s.geo.country,
            s.device.type,
            s.device.browser,
            s.device.os,
            s.referrer || "Direct",
          ])}
          emptyMessage="No one is currently browsing the store."
        />
      </div>
    </div>
  );
}
