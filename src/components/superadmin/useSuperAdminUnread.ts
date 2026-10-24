"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { getUnreadNotificationSummaryAction } from "@/app/(superadmin)/superadmin/(protected)/notifications/actions";
import { installChimeUnlock, playChime } from "@/lib/notifications/chime";
import { newlyArrived, startPoller, type Poller } from "@/lib/notifications/poller";

/**
 * Unread Super Admin notifications for the header bell AND the sidebar badge - one poll
 * (every 60 s while the tab is visible, paused when hidden or after 10 min idle, never overlapping), re-run on
 * navigation and when the notifications page changes read state. Chimes + toasts only for
 * notifications that weren't there on the previous poll (never on page load).
 */
export function useSuperAdminUnread(): number {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const knownRef = useRef<string[] | null>(null);
  const pollerRef = useRef<Poller | null>(null);

  useEffect(() => installChimeUnlock(), []);

  useEffect(() => {
    const load = async () => {
      const summary = await getUnreadNotificationSummaryAction();
      setCount(summary.count);
      const ids = summary.items.map((i) => i.id);
      const fresh = newlyArrived(knownRef.current, ids);
      knownRef.current = ids;
      if (fresh.length) {
        const first = summary.items.find((i) => i.id === fresh[0]);
        toast(first?.title || "New notification", { icon: "🔔", duration: 6000 });
        void playChime("notice");
      }
    };
    // 60 s while visible; paused after 10 min without activity (free-tier friendly).
    pollerRef.current = startPoller(load, 60000, undefined, { idleMs: 10 * 60 * 1000 });
    const onChange = () => pollerRef.current?.trigger();
    window.addEventListener("webriiz:notifications-changed", onChange);
    return () => {
      pollerRef.current?.stop();
      pollerRef.current = null;
      window.removeEventListener("webriiz:notifications-changed", onChange);
    };
  }, []);

  useEffect(() => {
    pollerRef.current?.trigger();
  }, [pathname]);

  return count;
}
