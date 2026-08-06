"use client";

import React, { FC } from "react";
import SocialsList1 from "@/shared/SocialsList1/SocialsList1";
import { useChromeSuppressed } from "@/lib/tenant/useChromeSuppressed";
import type { ThemeHeader } from "@/types/theme";

export interface TopBarProps {
  topBar?: ThemeHeader["topBar"];
}

const TopBar: FC<TopBarProps> = ({ topBar }) => {
  // Unlike the other chrome components, TopBar previously had no
  // pathname/tenant guard of its own - only the data-driven `enabled` check
  // below, which happens to be false on the platform domain today but gave
  // no protection on a real tenant's /superadmin view. This intentionally
  // does not add a new /admin check, matching SiteHeader/Footer's precedent.
  const isSuppressed = useChromeSuppressed();
  if (isSuppressed || !topBar?.enabled) {
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
