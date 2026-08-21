"use client";

import React, { FC } from "react";
import { usePathname } from "next/navigation";
import MainNav2Logged from "./MainNav2Logged";
import useHeaderScrollState from "@/hooks/useHeaderScrollState";
import type { ThemeHeader, ThemeLogos } from "@/types/theme";
import type { CartThemeConfig } from "@/lib/theme/theme-types";

export interface HeaderLoggedProps {
  headerSettings?: ThemeHeader;
  cartSettings?: CartThemeConfig;
  logos?: ThemeLogos;
  storeName?: string;
}

const HeaderLogged: FC<HeaderLoggedProps> = ({ headerSettings, cartSettings, logos, storeName }) => {
  const pathname = usePathname();
  const { scrolledPastHero } = useHeaderScrollState();

  const sticky = headerSettings?.sticky ?? true;
  const transparentActive =
    !!headerSettings?.transparent && pathname === "/" && !scrolledPastHero;

  return (
    <div
      className={`nc-HeaderLogged ${sticky ? "sticky top-0" : "relative"} w-full z-40 ${
        transparentActive ? "bg-transparent" : ""
      }`}
    >
      <MainNav2Logged headerSettings={headerSettings} cartSettings={cartSettings} transparentActive={transparentActive} logos={logos} storeName={storeName} />
    </div>
  );
};

export default HeaderLogged;
