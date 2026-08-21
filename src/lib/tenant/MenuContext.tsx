"use client";

import React, { createContext, useContext } from "react";
import type { NavItemType } from "@/shared/Navigation/NavigationItem";

export const DEFAULT_HEADER_ITEMS: NavItemType[] = [
  { id: "1", name: "Home", href: "/" },
  { id: "2", name: "Shop", href: "/collection" },
  { id: "3", name: "Collections", href: "/collection-2" },
  { id: "4", name: "About", href: "/about" },
];

export const DEFAULT_FOOTER_ITEMS: NavItemType[] = [
  { id: "1", name: "Home", href: "/" },
  { id: "2", name: "Shop", href: "/collection" },
  { id: "3", name: "About Us", href: "/about" },
];

interface MenuContextType {
  headerItems: NavItemType[];
  footerItems: NavItemType[];
}

const MenuContext = createContext<MenuContextType>({
  headerItems: DEFAULT_HEADER_ITEMS,
  footerItems: DEFAULT_FOOTER_ITEMS,
});

export const MenuProvider: React.FC<{
  headerItems?: NavItemType[];
  footerItems?: NavItemType[];
  children: React.ReactNode;
}> = ({ headerItems, footerItems, children }) => {
  const initialHeader = headerItems && headerItems.length > 0 ? headerItems : DEFAULT_HEADER_ITEMS;
  const initialFooter = footerItems && footerItems.length > 0 ? footerItems : DEFAULT_FOOTER_ITEMS;

  return (
    <MenuContext.Provider value={{ headerItems: initialHeader, footerItems: initialFooter }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenuContext = () => useContext(MenuContext);
