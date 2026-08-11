import type {
  Theme,
  ThemeColors,
  ThemeDarkColors,
  ThemeTypography,
  ThemeLogos,
  ThemeButtons,
  ThemeCards,
  ThemeHeader,
  ThemeFooter,
  ThemeBanner,
  ThemeLayout,
  ThemeDarkMode,
  ThemeProductCard,
  RadiusSize,
  ShadowLevel,
  HoverEffect,
  TransitionSpeed,
  FontKey,
} from "@/types/theme";

export type ThemePresetId = "modern-minimal" | "bold-commerce" | "premium-luxury";

export interface HeaderThemeConfig extends ThemeHeader {
  variant?: "centered" | "mega-menu" | "transparent-overlay";
  logoAlignment?: "left" | "center";
}

export interface FooterThemeConfig extends ThemeFooter {
  variant?: "multi-column" | "minimal-centered" | "newsletter-focused";
}

export interface ProductCardThemeConfig extends ThemeProductCard {
  variant?: "minimal" | "bold-grid" | "editorial";
  aspectRatio?: "1:1" | "3:4" | "4:5";
  showSecondaryImageOnHover?: boolean;
  showQuickAdd?: boolean;
  badgePosition?: "top-left" | "top-right";
  showWishlist?: boolean;
  showCompare?: boolean;
  showQuickView?: boolean;
}

export interface ProductDetailThemeConfig {
  variant?: "minimal" | "bold" | "luxury";
  galleryStyle?: "static" | "clickable-thumbnails";
  purchasePanelStyle?: "standard" | "sticky" | "compact";
  showCompare?: boolean;
}

export interface CartThemeConfig {
  variant?: "minimal" | "bold" | "luxury";
  drawerStyle?: "standard" | "compact" | "minimal";
  itemLayout?: "detailed" | "compact";
}

export interface PopupThemeConfig {
  enabled?: boolean;
  title?: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  trigger?: "page-load" | "delay" | "exit-intent";
  delaySeconds?: number;
  frequency?: "once-per-session" | "once-per-day" | "always";
  styleVariant?: "center-modal" | "bottom-slide" | "full-overlay";
}

export interface HomepageThemeSectionConfig {
  id: string;
  type: string;
  enabled: boolean;
  order: number;
  heading?: string;
  subHeading?: string;
  layoutVariant?: string;
  settings?: Record<string, unknown>;
}

export interface HomepageThemeConfig {
  sections?: HomepageThemeSectionConfig[];
}

export interface SystemThemeConfig extends Omit<Theme, "header" | "footer" | "productCard"> {
  presetId: ThemePresetId;
  header: HeaderThemeConfig;
  footer: FooterThemeConfig;
  productCard: ProductCardThemeConfig;
  productDetail?: ProductDetailThemeConfig;
  cart?: CartThemeConfig;
  homepage?: HomepageThemeConfig;
  popup?: PopupThemeConfig;
}

export type ThemeTokens = {
  colors: ThemeColors;
  darkColors?: ThemeDarkColors;
  typography: ThemeTypography;
  logos?: ThemeLogos;
  buttons: ThemeButtons;
  cards: ThemeCards;
  layout: ThemeLayout;
  darkMode?: ThemeDarkMode;
};
