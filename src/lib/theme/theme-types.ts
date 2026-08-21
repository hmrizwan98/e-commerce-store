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

export type ThemePresetId =
  | "modern-minimal"
  | "bold-commerce"
  | "premium-luxury"
  | "fashion-editorial"
  | "beauty-cosmetics"
  | "electronics-tech"
  | "streetwear-urban"
  | "furniture-home"
  | "grocery-fresh";

export interface HeaderThemeConfig extends ThemeHeader {
  variant?: "centered" | "mega-menu" | "transparent-overlay";
  logoAlignment?: "left" | "center";
}

export interface FooterThemeConfig extends ThemeFooter {
  variant?: "multi-column" | "minimal-centered" | "newsletter-focused";
}

export interface ProductCardThemeConfig extends ThemeProductCard {
  variant?: "minimal" | "bold-grid" | "editorial" | "deal-card" | "trend-glass" | "sleek-pill" | "sleek";
  aspectRatio?: "1:1" | "3:4" | "4:5" | "4:3";
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

export type ThemeStyleFamily = "generic" | "luxe" | "minimal" | "bold-street" | "tech" | "image-only";

export interface HeroThemeConfig {
  variant?: ThemeStyleFamily;
}

export interface CategoriesThemeConfig {
  variant?: ThemeStyleFamily;
}

export interface PromoThemeConfig {
  // Named `styleVariant` (not `variant`) to avoid colliding with
  // HomepageSection.config's unrelated numeric `variant?: 1|2|3`
  // (CMS promo-slot placement) read in the same render call.
  styleVariant?: ThemeStyleFamily;
}

export interface AnnouncementBarThemeConfig {
  variant?: ThemeStyleFamily;
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
  buttonText?: string;
  placeholderText?: string;
  layoutVariant?: string;
  settings?: Record<string, unknown>;
}

export interface HomepageThemeConfig {
  sections?: HomepageThemeSectionConfig[];
}

import type { HomepageSection } from "@/types/homepage-section";

export interface SystemThemeConfig extends Omit<Theme, "header" | "footer" | "productCard"> {
  presetId: ThemePresetId;
  header: HeaderThemeConfig;
  footer: FooterThemeConfig;
  productCard: ProductCardThemeConfig;
  productDetail?: ProductDetailThemeConfig;
  cart?: CartThemeConfig;
  homepage?: HomepageThemeConfig;
  popup?: PopupThemeConfig;
  hero?: HeroThemeConfig;
  categories?: CategoriesThemeConfig;
  promo?: PromoThemeConfig;
  announcementBar?: AnnouncementBarThemeConfig;
  homepageSections?: HomepageSection[];
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
