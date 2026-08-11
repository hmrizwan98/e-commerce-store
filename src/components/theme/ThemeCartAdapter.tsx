import React from "react";
import CartClient, { type CartClientProps } from "@/app/cart/CartClient";
import MinimalCartPage from "./variants/cart/MinimalCartPage";
import BoldCartPage from "./variants/cart/BoldCartPage";
import LuxuryCartPage from "./variants/cart/LuxuryCartPage";
import type { CartThemeConfig } from "@/lib/theme/theme-types";

export interface ThemeCartAdapterProps extends CartClientProps {
  cartSettings?: CartThemeConfig;
}

export default function ThemeCartAdapter({ cartSettings, ...props }: ThemeCartAdapterProps) {
  switch (cartSettings?.variant) {
    case "minimal":
      return <MinimalCartPage {...props} itemLayout={cartSettings.itemLayout} />;
    case "bold":
      return <BoldCartPage {...props} itemLayout={cartSettings.itemLayout} />;
    case "luxury":
      return <LuxuryCartPage {...props} itemLayout={cartSettings.itemLayout} />;
    default:
      return <CartClient {...props} />;
  }
}
