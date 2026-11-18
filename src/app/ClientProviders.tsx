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
import { isThemeTopBarActive } from "@/lib/theme/announcement";
import SiteHeader from "@/app/SiteHeader";
import CommonClient from "./CommonClient";
import Footer from "@/shared/Footer/Footer";
import { TenantProvider } from "@/lib/tenant/TenantContext";
import { MenuProvider } from "@/lib/tenant/MenuContext";
import { SocialLinksProvider } from "@/lib/tenant/SocialLinksContext";
import ThemePopupModal from "@/components/theme/ThemePopupModal";
import StorePreloader from "@/components/StorePreloader";
import type { ThemeHeader, ThemeFooter, ThemeLogos } from "@/types/theme";
import type { PopupThemeConfig, CartThemeConfig, AnnouncementBarThemeConfig } from "@/lib/theme/theme-types";
import type { NavItemType } from "@/shared/Navigation/NavigationItem";

import { usePathname } from "next/navigation";

import type { GeneralSettings } from "@/types/site-settings";

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
  /** Menu links to hide because the page doesn't exist for this store (e.g. "/about"). */
  hiddenNavHrefs?: string[];
  logos?: ThemeLogos;
  socialLinks?: GeneralSettings["socialLinks"];
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
  hiddenNavHrefs,
  logos,
  socialLinks,
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
    // The Customizer preview renders the storefront inside /admin: it must follow the same
    // rules as the live store (no About link without an About page, the store's real social
    // links). Every other admin page - e.g. the menu editor - sees the menus unfiltered.
    const isStorefrontPreview = Boolean(pathname?.startsWith("/admin/theme-customizer-preview"));
    return (
      <TenantProvider tenantId={tenantId}>
        <SocialLinksProvider value={socialLinks}>
        <MenuProvider headerItems={headerMenu} footerItems={footerMenu} hiddenHrefs={isStorefrontPreview ? hiddenNavHrefs : undefined}>
          <Provider store={store}>
            <CartHydrator />
            {children}
            <CommonClient />
          </Provider>
        </MenuProvider>
        </SocialLinksProvider>
      </TenantProvider>
    );
  }

  if (!tenantId) {
    return (
      <TenantProvider tenantId="">
        <MenuProvider>
          {children}
          <CommonClient />
        </MenuProvider>
      </TenantProvider>
    );
  }

  return (
    <TenantProvider tenantId={tenantId}>
      <SocialLinksProvider value={socialLinks}>
      <MenuProvider headerItems={headerMenu} footerItems={footerMenu} hiddenHrefs={hiddenNavHrefs}>
        <Provider store={store}>
          <StorePreloader storeName={storeName} logoUrl={logos?.loadingLogo || logos?.logoLight} />
          <CartHydrator />
          <PageViewTracker />
          <MarketingPixels />
          <AnnouncementBar hidden={isThemeTopBarActive(headerSettings.topBar)} />
          <ThemeAnnouncementBarAdapter announcementSettings={announcementBarSettings} topBar={headerSettings.topBar} />
          <SiteHeader headerSettings={headerSettings} cartSettings={cartSettings} logos={logos} storeName={storeName} />
          {children}
          <CommonClient />
          <Footer footerSettings={footerSettings} logos={logos} storeName={storeName} socialLinks={socialLinks} />
          <WhatsAppButton />
          <ThemePopupModal popupConfig={popupConfig} tenantId={tenantId} themePresetId={themePresetId} />
        </Provider>
      </MenuProvider>
      </SocialLinksProvider>
    </TenantProvider>
  );
};

export default ClientProviders;
