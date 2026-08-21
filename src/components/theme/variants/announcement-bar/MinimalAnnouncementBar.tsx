"use client";

import React from "react";
import SocialsList1 from "@/shared/SocialsList1/SocialsList1";
import { useChromeSuppressed } from "@/lib/tenant/useChromeSuppressed";
import type { ThemeHeader } from "@/types/theme";
import type { AnnouncementBarVariantProps } from "./LuxeAnnouncementBar";

export default function MinimalAnnouncementBar({ topBar }: AnnouncementBarVariantProps) {
  const isSuppressed = useChromeSuppressed();
  if (isSuppressed || !topBar?.enabled) return null;

  return (
    <div className="nc-TopBar bg-[var(--top-bar-bg)] text-white">
      <div className="container flex flex-wrap items-center justify-center gap-3 py-1.5 text-xs font-medium">
        {topBar.text && <span>{topBar.text}</span>}
        {(topBar.phone || topBar.email || topBar.showSocialIcons) && (
          <div className="flex items-center gap-3">
            {topBar.phone && (
              <a href={`tel:${topBar.phone}`} className="hover:underline">
                {topBar.phone}
              </a>
            )}
            {topBar.email && (
              <a href={`mailto:${topBar.email}`} className="hover:underline">
                {topBar.email}
              </a>
            )}
            {topBar.showSocialIcons && <SocialsList1 className="flex items-center space-x-2" />}
          </div>
        )}
      </div>
    </div>
  );
}
