"use client";

import { useEffect } from "react";
import { trackEvent, type TrackEventInput } from "@/lib/analytics/track";
import type { AnalyticsEventType } from "@/types/analytics-event";

/** Drop into a Server Component page to fire one event on mount, without converting the page to a client component. */
export default function EventTracker({
  type,
  ...input
}: { type: AnalyticsEventType } & TrackEventInput) {
  useEffect(() => {
    trackEvent(type, input);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, input.productId, input.categoryId, input.brandId, input.searchQuery, input.value]);
  return null;
}
