"use client";

import React from "react";
import Link from "next/link";
import { BellIcon } from "@heroicons/react/24/outline";

/** Header bell - the count comes from SuperAdminShell's single poll (useSuperAdminUnread). */
export default function NotificationBell({ count }: { count: number }) {
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
