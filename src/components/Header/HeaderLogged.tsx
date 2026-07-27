"use client";

import React, { FC } from "react";
import { usePathname } from "next/navigation";
import MainNav2Logged from "./MainNav2Logged";
import useHeaderScrollState from "@/hooks/useHeaderScrollState";
import type { ThemeHeader } from "@/types/theme";

export interface HeaderLoggedProps {
  headerSettings?: ThemeHeader;
}

const HeaderLogged: FC<HeaderLoggedProps> = ({ headerSettings }) => {
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
      <MainNav2Logged headerSettings={headerSettings} transparentActive={transparentActive} />
    </div>
  );
};

export default HeaderLogged;
