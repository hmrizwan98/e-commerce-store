"use client";

import React from "react";
import TopBar from "@/components/TopBar";
import LuxeAnnouncementBar from "./variants/announcement-bar/LuxeAnnouncementBar";
import MinimalAnnouncementBar from "./variants/announcement-bar/MinimalAnnouncementBar";
import BoldStreetAnnouncementBar from "./variants/announcement-bar/BoldStreetAnnouncementBar";
import TechAnnouncementBar from "./variants/announcement-bar/TechAnnouncementBar";
import type { AnnouncementBarThemeConfig } from "@/lib/theme/theme-types";
import type { ThemeHeader } from "@/types/theme";

export interface ThemeAnnouncementBarAdapterProps {
  announcementSettings?: AnnouncementBarThemeConfig;
  topBar?: ThemeHeader["topBar"];
}

export default function ThemeAnnouncementBarAdapter({ announcementSettings, topBar }: ThemeAnnouncementBarAdapterProps) {
  switch (announcementSettings?.variant) {
    case "luxe":
      return <LuxeAnnouncementBar topBar={topBar} />;
    case "minimal":
      return <MinimalAnnouncementBar topBar={topBar} />;
    case "bold-street":
      return <BoldStreetAnnouncementBar topBar={topBar} />;
    case "tech":
      return <TechAnnouncementBar topBar={topBar} />;
    default:
      return <TopBar topBar={topBar} />;
  }
}
