"use client";

import React from "react";
import SocialsList1 from "@/shared/SocialsList1/SocialsList1";
import { useChromeSuppressed } from "@/lib/tenant/useChromeSuppressed";
import type { AnnouncementBarVariantProps } from "./LuxeAnnouncementBar";

export default function BoldStreetAnnouncementBar({ topBar }: AnnouncementBarVariantProps) {
  const isSuppressed = useChromeSuppressed();
  if (isSuppressed || !topBar?.enabled) return null;

  return (
    <div className="nc-TopBar bg-[var(--top-bar-bg)] text-white border-b-2 border-rose-600">
      <div className="container flex flex-wrap items-center justify-center gap-4 py-2 text-[11px] font-black uppercase tracking-widest">
        {topBar.text && <span>⚡ {topBar.text}</span>}
        <div className="flex items-center gap-4">
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
          {topBar.showSocialIcons && <SocialsList1 className="flex items-center space-x-3" />}
        </div>
      </div>
    </div>
  );
}
