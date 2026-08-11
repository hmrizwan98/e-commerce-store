"use client";

import React from "react";
import { Provider } from "react-redux";
import store from "./../store";
import CartHydrator from "./../store/CartHydrator";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import MarketingPixels from "@/components/analytics/MarketingPixels";
import WhatsAppButton from "@/components/WhatsAppButton";
import AnnouncementBar from "@/components/AnnouncementBar";
import TopBar from "@/components/TopBar";
import SiteHeader from "@/app/SiteHeader";
import CommonClient from "./CommonClient";
import Footer from "@/shared/Footer/Footer";
import { TenantProvider } from "@/lib/tenant/TenantContext";
import ThemePopupModal from "@/components/theme/ThemePopupModal";
import type { ThemeHeader, ThemeFooter } from "@/types/theme";
import type { PopupThemeConfig, CartThemeConfig } from "@/lib/theme/theme-types";

export interface ClientProvidersProps {
  children: React.ReactNode;
  headerSettings: ThemeHeader;
  footerSettings: ThemeFooter;
  storeName: string;
  tenantId: string;
  popupConfig?: PopupThemeConfig;
  themePresetId?: string;
  cartSettings?: CartThemeConfig;
}

/**
 * Everything that used to live directly in the (client) RootLayout, unchanged
 * behavior-wise - just relocated so layout.tsx itself can be a Server
 * Component and export generateMetadata() (dynamic favicon/title need that).
 */
const ClientProviders: React.FC<ClientProvidersProps> = ({
  children,
  headerSettings,
  footerSettings,
  storeName,
  tenantId,
  popupConfig,
  themePresetId,
  cartSettings,
}) => {
  return (
    <TenantProvider tenantId={tenantId}>
      <Provider store={store}>
        <CartHydrator />
        <PageViewTracker />
        <MarketingPixels />
        <AnnouncementBar />
        <TopBar topBar={headerSettings.topBar} />
        <SiteHeader headerSettings={headerSettings} cartSettings={cartSettings} />
        {children}
        <CommonClient />
        <Footer footerSettings={footerSettings} storeName={storeName} />
        <WhatsAppButton />
        <ThemePopupModal popupConfig={popupConfig} tenantId={tenantId} themePresetId={themePresetId} />
      </Provider>
    </TenantProvider>
  );
};

export default ClientProviders;
