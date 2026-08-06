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

  if (isAdminRoute || !bar || dismissed) return null;
  if (!bar.showOnDesktop && !bar.showOnMobile) return null;

  const visibilityClass =
    bar.showOnDesktop && bar.showOnMobile ? "flex" : bar.showOnDesktop ? "hidden lg:flex" : "flex lg:hidden";

  const handleClose = () => {
    window.localStorage.setItem(dismissKey(bar.id), "1");
    setDismissed(true);
  };

  return (
    <div
      className={`${visibilityClass} relative items-center justify-center gap-1 px-10 py-2 text-sm text-center overflow-hidden`}
      style={{ color: bar.textColor, backgroundColor: bar.backgroundColor }}
    >
      <span className={bar.autoScroll ? "announcement-marquee" : ""}>
        <span className="font-medium">{bar.title}</span>
        {bar.subtitle && <span className="ml-2 font-normal opacity-90">{bar.subtitle}</span>}
      </span>
      {bar.buttonText && bar.buttonHref && (
        <Link href={bar.buttonHref as any} className="ml-3 underline underline-offset-2 font-semibold whitespace-nowrap">
          {bar.buttonText}
        </Link>
      )}
      {bar.isClosable && (
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
