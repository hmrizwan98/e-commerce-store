"use client";

import { detectDevice, detectGeo } from "./device";
import { getSessionId, getVisitorId, getSessionUtm } from "./session";
import type { AnalyticsEventType } from "@/types/analytics-event";

export interface TrackEventInput {
  productId?: string;
  categoryId?: string;
  brandId?: string;
  searchQuery?: string;
  value?: number;
}

function send(url: string, body: unknown) {
  const json = JSON.stringify(body);
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([json], { type: "application/json" }));
    return;
  }
  fetch(url, { method: "POST", body: json, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(
    () => {}
  );
}

/** Fire-and-forget - never throws, never blocks the calling UI action. */
export function trackEvent(type: AnalyticsEventType, input: TrackEventInput = {}): void {
  if (typeof window === "undefined") return;
  send("/api/analytics/track", {
    type,
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    path: window.location.pathname,
    referrer: document.referrer || undefined,
    device: detectDevice(),
    geo: detectGeo(),
    ...getSessionUtm(),
    ...input,
  });
}

/** Realtime "active users" presence ping - no event is logged, only activeSessions.lastSeenAt. */
export function trackHeartbeat(): void {
  if (typeof window === "undefined") return;
  send("/api/analytics/heartbeat", {
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    path: window.location.pathname,
    referrer: document.referrer || undefined,
    device: detectDevice(),
    geo: detectGeo(),
  });
}
