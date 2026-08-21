"use client";

import React from "react";
import SocialsList1 from "@/shared/SocialsList1/SocialsList1";
import { useChromeSuppressed } from "@/lib/tenant/useChromeSuppressed";
import type { AnnouncementBarVariantProps } from "./LuxeAnnouncementBar";

export default function TechAnnouncementBar({ topBar }: AnnouncementBarVariantProps) {
  const isSuppressed = useChromeSuppressed();
  if (isSuppressed || !topBar?.enabled) return null;

  return (
    <div className="nc-TopBar bg-[var(--top-bar-bg)] text-sky-50 border-b border-slate-800">
      <div className="container flex flex-wrap items-center justify-center gap-4 py-2 text-xs font-semibold">
        {topBar.text && (
          <span className="inline-flex items-center gap-1.5">
            <span className="text-sky-400">⚡</span> {topBar.text}
          </span>
        )}
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
