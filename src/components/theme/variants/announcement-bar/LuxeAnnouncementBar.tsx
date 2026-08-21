"use client";

import React from "react";
import SocialsList1 from "@/shared/SocialsList1/SocialsList1";
import { useChromeSuppressed } from "@/lib/tenant/useChromeSuppressed";
import type { ThemeHeader } from "@/types/theme";

export interface AnnouncementBarVariantProps {
  topBar?: ThemeHeader["topBar"];
}

export default function LuxeAnnouncementBar({ topBar }: AnnouncementBarVariantProps) {
  const isSuppressed = useChromeSuppressed();
  if (isSuppressed || !topBar?.enabled) return null;

  return (
    <div className="nc-TopBar bg-[var(--top-bar-bg)] text-stone-50 border-b border-amber-900/20">
      <div className="container flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 text-center">
        {topBar.text && (
          <span className="font-serif text-[11px] tracking-[0.25em] uppercase">{topBar.text}</span>
        )}
        <div className="flex items-center gap-4 text-[11px] font-serif tracking-widest">
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
