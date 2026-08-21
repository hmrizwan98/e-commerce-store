"use client";

import React from "react";
import StandardCartDrawer from "./variants/cart-drawer/StandardCartDrawer";
import CompactCartDrawer from "./variants/cart-drawer/CompactCartDrawer";
import MinimalCartDrawer from "./variants/cart-drawer/MinimalCartDrawer";
import type { CartThemeConfig } from "@/lib/theme/theme-types";
import type { CartItem } from "@/store/slices/cartSlice";

export interface ThemeCartDrawerAdapterProps {
  cartSettings?: CartThemeConfig;
  items: CartItem[];
  subtotal: number;
  onRemove: (item: CartItem) => void;
  close: () => void;
}

export default function ThemeCartDrawerAdapter({ cartSettings, ...props }: ThemeCartDrawerAdapterProps) {
  switch (cartSettings?.drawerStyle) {
    case "compact":
      return <CompactCartDrawer {...props} />;
    case "minimal":
      return <MinimalCartDrawer {...props} />;
    default:
      return <StandardCartDrawer {...props} />;
  }
}
