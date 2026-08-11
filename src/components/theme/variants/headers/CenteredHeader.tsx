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

export default function CenteredHeader({ headerSettings, cartSettings }: HeaderVariantProps) {
  const showSearch = headerSettings?.showSearch ?? true;
  const showAccount = headerSettings?.showAccount ?? true;
  const showCart = headerSettings?.showCart ?? true;

  return (
    <header className="relative w-full z-40 bg-[var(--header-bg)] border-b border-[var(--border)] transition-all duration-200">
      <div className="container py-4 flex items-center justify-between gap-6">
        <div className="flex-1 lg:hidden">
          <MenuBar />
        </div>
        
        <div className="flex items-center gap-6">
          <Logo />
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
