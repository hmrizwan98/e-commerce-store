"use client";

import React from "react";
import { usePathname } from "next/navigation";
import HeaderLogged from "@/components/Header/HeaderLogged";
import Header from "@/components/Header/Header";
import { useThemeMode } from "@/hooks/useThemeMode";
import { useChromeSuppressed } from "@/lib/tenant/useChromeSuppressed";
import type { ThemeHeader } from "@/types/theme";

export interface SiteHeaderProps {
  headerSettings?: ThemeHeader;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ headerSettings }) => {
  useThemeMode();

  let pathname = usePathname();
  // This intentionally does not add a new /admin check - SiteHeader never
  // suppressed itself there before this change either, and that's out of
  // scope here.
  const isSuppressed = useChromeSuppressed();
  if (isSuppressed) return null;

  return pathname === "/home-2" ? <Header /> : <HeaderLogged headerSettings={headerSettings} />;
};

export default SiteHeader;
