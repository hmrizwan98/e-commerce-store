"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/track";

export default function NotFoundTracker() {
  useEffect(() => {
    trackEvent("not_found");
  }, []);
  return null;
}
