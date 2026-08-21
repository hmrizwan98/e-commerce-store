"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useChromeSuppressed } from "@/lib/tenant/useChromeSuppressed";
import type { AnnouncementBar as AnnouncementBarData } from "@/types/announcement-bar";

function dismissKey(id: string) {
  return `announcementDismissed:${id}`;
}

/**
 * Root layout here is a client component (see src/app/layout.tsx), so this
 * fetches the active bar client-side from a public route instead of reading
 * Firestore directly - same pattern as PageViewTracker/MarketingPixels/WhatsAppButton.
 */
export default function AnnouncementBar() {
  const isAdminRoute = useChromeSuppressed({ includeAdmin: true });
  const [bar, setBar] = useState<AnnouncementBarData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isAdminRoute) return;
    fetch("/api/announcements/active")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setBar(data?.bar ?? null))
      .catch(() => {});
  }, [isAdminRoute]);

  useEffect(() => {
    if (bar?.isClosable && window.localStorage.getItem(dismissKey(bar.id)) === "1") {
      setDismissed(true);
    }
  }, [bar]);

  const activeBar: AnnouncementBarData = bar ?? {
    id: "default",
    title: "✦ FREE SHIPPING ON ALL ORDERS ✦",
    subtitle: "",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    showOnDesktop: true,
    showOnMobile: true,
    isClosable: false,
    autoScroll: false,
    priority: 1,
    isActive: true,
    order: 1,
    createdAt: 0,
    updatedAt: 0,
  };

  if (isAdminRoute || dismissed) return null;
  if (!activeBar.showOnDesktop && !activeBar.showOnMobile) return null;

  const visibilityClass =
    activeBar.showOnDesktop && activeBar.showOnMobile ? "flex" : activeBar.showOnDesktop ? "hidden lg:flex" : "flex lg:hidden";

  const handleClose = () => {
    if (activeBar.id !== "default") {
      window.localStorage.setItem(dismissKey(activeBar.id), "1");
    }
    setDismissed(true);
  };

  return (
    <div
      className={`${visibilityClass} relative items-center justify-center gap-1 px-10 py-2.5 text-xs sm:text-sm tracking-wider text-center overflow-hidden font-mono uppercase font-bold`}
      style={{ color: activeBar.textColor, backgroundColor: activeBar.backgroundColor }}
    >
      <span className={activeBar.autoScroll ? "announcement-marquee" : ""}>
        <span>{activeBar.title}</span>
        {activeBar.subtitle && <span className="ml-2 opacity-90">{activeBar.subtitle}</span>}
      </span>
      {activeBar.buttonText && activeBar.buttonHref && (
        <Link href={activeBar.buttonHref as any} className="ml-3 underline underline-offset-2 font-semibold whitespace-nowrap">
          {activeBar.buttonText}
        </Link>
      )}
      {activeBar.isClosable && (
        <button
          onClick={handleClose}
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-80 hover:opacity-100"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
