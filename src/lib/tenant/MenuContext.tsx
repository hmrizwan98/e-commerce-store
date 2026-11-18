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

const EMPTY_HIDDEN: string[] = [];

interface MenuContextType {
  headerItems: NavItemType[];
  footerItems: NavItemType[];
  /** Links to pages this store doesn't have (e.g. "/about") - filtered out by useMenu. */
  hiddenHrefs: string[];
}

const MenuContext = createContext<MenuContextType>({
  headerItems: DEFAULT_HEADER_ITEMS,
  footerItems: DEFAULT_FOOTER_ITEMS,
  hiddenHrefs: [],
});

export const MenuProvider: React.FC<{
  headerItems?: NavItemType[] | null;
  footerItems?: NavItemType[] | null;
  hiddenHrefs?: string[];
  children: React.ReactNode;
}> = ({ headerItems, footerItems, hiddenHrefs = EMPTY_HIDDEN, children }) => {
  // null/undefined = the store never saved this menu -> starter menu. An empty array means the
  // admin removed every item, which must stay empty.
  const initialHeader = headerItems ?? DEFAULT_HEADER_ITEMS;
  const initialFooter = footerItems ?? DEFAULT_FOOTER_ITEMS;

  return (
    <MenuContext.Provider value={{ headerItems: initialHeader, footerItems: initialFooter, hiddenHrefs }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenuContext = () => useContext(MenuContext);
