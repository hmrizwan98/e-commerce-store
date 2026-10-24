"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon } from "@heroicons/react/24/outline";
import { getUnreadNotificationCountAction } from "@/app/(superadmin)/superadmin/(protected)/notifications/actions";

/** Unread backup / commission requests. Refreshes on navigation and every 60 s while the
 * tab is visible (server-authoritative count - notifications aren't client-readable). */
export default function NotificationBell() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () => {
      if (document.visibilityState !== "visible") return;
      getUnreadNotificationCountAction()
        .then((n) => alive && setCount(n))
        .catch(() => {});
    };
    load();
    const timer = setInterval(load, 60000);
    document.addEventListener("visibilitychange", load);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, [pathname]);

  return (
    <Link
      href={"/notifications" as any}
      aria-label={count ? `${count} unread notifications` : "Notifications"}
      className="relative p-2 rounded-xl text-white hover:bg-white/15 transition-colors"
    >
      <BellIcon className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-bold flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
