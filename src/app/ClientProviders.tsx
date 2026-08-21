"use client";

import React from "react";
import { Provider } from "react-redux";
import store from "./../store";
import CartHydrator from "./../store/CartHydrator";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import MarketingPixels from "@/components/analytics/MarketingPixels";
import WhatsAppButton from "@/components/WhatsAppButton";
import AnnouncementBar from "@/components/AnnouncementBar";
import ThemeAnnouncementBarAdapter from "@/components/theme/ThemeAnnouncementBarAdapter";
import SiteHeader from "@/app/SiteHeader";
import CommonClient from "./CommonClient";
import Footer from "@/shared/Footer/Footer";
import { TenantProvider } from "@/lib/tenant/TenantContext";
import { MenuProvider } from "@/lib/tenant/MenuContext";
import ThemePopupModal from "@/components/theme/ThemePopupModal";
import type { ThemeHeader, ThemeFooter, ThemeLogos } from "@/types/theme";
import type { PopupThemeConfig, CartThemeConfig, AnnouncementBarThemeConfig } from "@/lib/theme/theme-types";
import type { NavItemType } from "@/shared/Navigation/NavigationItem";

import { usePathname } from "next/navigation";

export interface ClientProvidersProps {
  children: React.ReactNode;
  headerSettings: ThemeHeader;
  footerSettings: ThemeFooter;
  storeName: string;
  tenantId: string;
  popupConfig?: PopupThemeConfig;
  themePresetId?: string;
  cartSettings?: CartThemeConfig;
  announcementBarSettings?: AnnouncementBarThemeConfig;
  headerMenu?: NavItemType[];
  footerMenu?: NavItemType[];
  logos?: ThemeLogos;
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
  announcementBarSettings,
  headerMenu,
  footerMenu,
  logos,
}) => {
  const pathname = usePathname();
  const isAdminRoute = Boolean(
    pathname && (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/superadmin") ||
      pathname.includes("/admin")
    )
  );

  if (isAdminRoute) {
    return (
      <TenantProvider tenantId={tenantId}>
        <MenuProvider headerItems={headerMenu} footerItems={footerMenu}>
          <Provider store={store}>
            <CartHydrator />
            {children}
            <CommonClient />
          </Provider>
        </MenuProvider>
      </TenantProvider>
    );
  }

  return (
    <TenantProvider tenantId={tenantId}>
      <MenuProvider headerItems={headerMenu} footerItems={footerMenu}>
        <Provider store={store}>
          <CartHydrator />
          <PageViewTracker />
          <MarketingPixels />
          <AnnouncementBar />
          <ThemeAnnouncementBarAdapter announcementSettings={announcementBarSettings} topBar={headerSettings.topBar} />
          <SiteHeader headerSettings={headerSettings} cartSettings={cartSettings} logos={logos} storeName={storeName} />
          {children}
          <CommonClient />
          <Footer footerSettings={footerSettings} storeName={storeName} />
          <WhatsAppButton />
          <ThemePopupModal popupConfig={popupConfig} tenantId={tenantId} themePresetId={themePresetId} />
        </Provider>
      </MenuProvider>
    </TenantProvider>
  );
};

export default ClientProviders;
