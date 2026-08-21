"use client";

import React from "react";
import Logo from "@/shared/Logo/Logo";
import Navigation from "@/shared/Navigation/Navigation";
import SearchDropdown from "@/components/Header/SearchDropdown";
import CartDropdown from "@/components/Header/CartDropdown";
import AvatarDropdown from "@/components/Header/AvatarDropdown";
import MenuBar from "@/shared/MenuBar/MenuBar";
import type { HeaderThemeConfig, CartThemeConfig } from "@/lib/theme/theme-types";
import type { ThemeLogos } from "@/types/theme";

export interface HeaderVariantProps {
  headerSettings?: HeaderThemeConfig;
  cartSettings?: CartThemeConfig;
  logos?: ThemeLogos;
  storeName?: string;
}

export default function CenteredHeader({ headerSettings, cartSettings, logos, storeName }: HeaderVariantProps) {
  const showSearch = headerSettings?.showSearch ?? true;
  const showAccount = headerSettings?.showAccount ?? true;
  const showCart = headerSettings?.showCart ?? true;
  const customHeight = headerSettings?.heightPx ? `${headerSettings.heightPx}px` : undefined;

  return (
    <header className="relative w-full z-40 bg-[var(--header-bg)] border-b border-[var(--border)] transition-all duration-200">
      <div
        className={`container flex items-center justify-between gap-6 ${customHeight ? "" : "min-h-[50px] py-2"}`}
        style={customHeight ? { height: customHeight } : undefined}
      >
        <div className="flex-1 lg:hidden">
          <MenuBar />
        </div>
        
        <div className="flex items-center gap-6">
          <Logo img={logos?.logoLight} imgLight={logos?.logoDark} storeName={storeName} logoHeightPx={headerSettings?.logoHeightPx} />
        </div>

        <div className="hidden lg:flex items-center justify-center flex-1">
          <Navigation />
        </div>

        <div className="flex items-center gap-3">
          {showSearch && <SearchDropdown />}
          {showAccount && <AvatarDropdown />}
          {showCart && <CartDropdown cartSettings={cartSettings} />}
        </div>
      </div>
    </header>
  );
}
