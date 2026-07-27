"use client";

import React from "react";
import { usePathname } from "next/navigation";
import HeaderLogged from "@/components/Header/HeaderLogged";
import Header from "@/components/Header/Header";
import { useThemeMode } from "@/hooks/useThemeMode";
import type { ThemeHeader } from "@/types/theme";

export interface SiteHeaderProps {
  headerSettings?: ThemeHeader;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ headerSettings }) => {
  useThemeMode();

  let pathname = usePathname();

  return pathname === "/home-2" ? <Header /> : <HeaderLogged headerSettings={headerSettings} />;
};

export default SiteHeader;
