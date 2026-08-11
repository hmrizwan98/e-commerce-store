"use client";

import React from "react";
import MenuEditor from "../../../menus/MenuEditor";
import type { LinkPickerOptions } from "../../../menus/NavItemEditor";
import type { NavItem } from "@/types/nav";

export interface NavigationTabProps {
  headerItems: NavItem[];
  footerItems: NavItem[];
  options: LinkPickerOptions;
}

/**
 * Embeds the same, already-live menu editor used at /admin/menus - the real
 * storefront header/footer nav is fed from this via useMenu(), not from any
 * theme-config field.
 */
export default function NavigationTab({ headerItems, footerItems, options }: NavigationTabProps) {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Header menu</h2>
        <MenuEditor menuId="header" initialItems={headerItems} options={options} />
      </section>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Footer menu</h2>
        <MenuEditor menuId="footer" initialItems={footerItems} options={options} />
      </section>
    </div>
  );
}
