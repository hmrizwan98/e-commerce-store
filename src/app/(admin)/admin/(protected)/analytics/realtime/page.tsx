import React from "react";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import RealtimeClient from "./RealtimeClient";

export default function AdminAnalyticsRealtimePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Realtime</h1>
      <AnalyticsNav />
      <RealtimeClient />
    </div>
  );
}
