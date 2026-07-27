"use client";

import React, { FC } from "react";
import SocialsList1 from "@/shared/SocialsList1/SocialsList1";
import type { ThemeHeader } from "@/types/theme";

export interface TopBarProps {
  topBar?: ThemeHeader["topBar"];
}

const TopBar: FC<TopBarProps> = ({ topBar }) => {
  if (!topBar?.enabled) {
    return null;
  }

  return (
    <div className="nc-TopBar bg-[var(--top-bar-bg)] text-white">
      <div className="container flex flex-wrap items-center justify-between gap-2 py-2 text-xs sm:text-sm">
        <div className="flex items-center gap-4">{topBar.text && <span>{topBar.text}</span>}</div>
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
          {topBar.showSocialIcons && (
            <SocialsList1 className="flex items-center space-x-3" />
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
