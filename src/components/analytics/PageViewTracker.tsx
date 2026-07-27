"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, trackHeartbeat } from "@/lib/analytics/track";

/** Mounted once in the root layout - fires page_view on every route change and keeps a realtime "active now" heartbeat alive. */
export default function PageViewTracker() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) return;
    trackEvent("page_view");
    trackHeartbeat();
  }, [pathname, isAdminRoute]);

  useEffect(() => {
    if (isAdminRoute) return;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") trackHeartbeat();
    }, 20000);
    return () => clearInterval(interval);
  }, [isAdminRoute]);

  return null;
}
