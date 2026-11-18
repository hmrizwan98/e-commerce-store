"use client";

import React, { createContext, useContext } from "react";
import type { GeneralSettings } from "@/types/site-settings";

type SocialLinks = GeneralSettings["socialLinks"];
const SocialLinksContext = createContext<SocialLinks>(undefined);

/** The store's own social links (Settings → General) for every social-icon list. */
export function SocialLinksProvider({ value, children }: { value: SocialLinks; children: React.ReactNode }) {
  return <SocialLinksContext.Provider value={value}>{children}</SocialLinksContext.Provider>;
}

export const useSocialLinks = () => useContext(SocialLinksContext);
