"use client";

import React from "react";
import Logo from "@/shared/Logo/Logo";
import Navigation from "@/shared/Navigation/Navigation";
import SearchDropdown from "@/components/Header/SearchDropdown";
import CartDropdown from "@/components/Header/CartDropdown";
import AvatarDropdown from "@/components/Header/AvatarDropdown";
import MenuBar from "@/shared/MenuBar/MenuBar";
import type { HeaderThemeConfig, CartThemeConfig } from "@/lib/theme/theme-types";

export interface HeaderVariantProps {
  headerSettings?: HeaderThemeConfig;
  cartSettings?: CartThemeConfig;
}

export default function TransparentHeader({ headerSettings, cartSettings }: HeaderVariantProps) {
  const showSearch = headerSettings?.showSearch ?? true;
  const showAccount = headerSettings?.showAccount ?? true;
  const showCart = headerSettings?.showCart ?? true;

  return (
    <header className="relative w-full z-40 bg-[var(--header-bg)]/90 backdrop-blur-md transition-all duration-300 border-b border-[var(--border)]/50">
      <div className="container py-6 flex items-center justify-between gap-8">
        <div className="flex-1 lg:hidden">
          <MenuBar />
        </div>

        <div className="hidden lg:flex items-center space-x-8 flex-1">
          <Navigation />
        </div>
        
        <div className="flex items-center justify-center">
          <Logo />
        </div>

        <div className="flex items-center justify-end gap-5 flex-1">
          {showSearch && <SearchDropdown />}
          {showAccount && <AvatarDropdown />}
          {showCart && <CartDropdown cartSettings={cartSettings} />}
        </div>
      </div>
    </header>
  );
}
