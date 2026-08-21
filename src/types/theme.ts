export type RadiusSize = "none" | "sm" | "md" | "lg" | "xl" | "full";
export type ShadowLevel = "none" | "sm" | "md" | "lg" | "xl";
export type HoverEffect = "none" | "lift" | "scale" | "glow";
export type TransitionSpeed = "fast" | "normal" | "slow";
export type FontKey =
  | "poppins"
  | "inter"
  | "montserrat"
  | "roboto"
  | "openSans"
  | "lato"
  | "nunito"
  | "playfairDisplay"
  | "raleway"
  | "workSans";

/** Hex colors only (`#rrggbb`) - validated strictly before ever reaching CSS, see src/lib/theme/css-variables.ts. */
export interface ThemeColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  background?: string;
  surface?: string;
  card?: string;
  border?: string;
  heading?: string;
  text?: string;
  mutedText?: string;
  headerBackground?: string;
  footerBackground?: string;
  topBarBackground?: string;
  buttonBackground?: string;
  buttonHoverBackground?: string;
  buttonText?: string;
  link?: string;
  linkHover?: string;
  badgeSale?: string;
  badgeNew?: string;
  badgeOutOfStock?: string;
}

/** Only the subset of ThemeColors that make sense to override in dark mode. */
export interface ThemeDarkColors {
  primary?: string;
  background?: string;
  card?: string;
  text?: string;
  headerBackground?: string;
  footerBackground?: string;
  border?: string;
}

export interface ThemeTypography {
  headingFont?: FontKey;
  bodyFont?: FontKey;
  baseFontSizePx?: number;
  lineHeight?: number;
  letterSpacingPx?: number;
  headingWeight?: 400 | 500 | 600 | 700 | 800;
  bodyWeight?: 400 | 500 | 600;
  buttonWeight?: 400 | 500 | 600 | 700;
}

export interface ThemeLogos {
  logoLight?: string;
  logoDark?: string;
  favicon?: string;
  appleTouchIcon?: string;
  loadingLogo?: string;
  footerLogo?: string;
}

export interface ThemeButtons {
  radius?: RadiusSize;
  heightPx?: number;
  shadow?: ShadowLevel;
  hoverEffect?: HoverEffect;
  border?: boolean;
  paddingX?: number;
  paddingY?: number;
  transitionSpeed?: TransitionSpeed;
}

export interface ThemeCards {
  radius?: RadiusSize;
  shadow?: ShadowLevel;
  border?: boolean;
  hoverEffect?: HoverEffect;
  spacingPx?: number;
  background?: string;
}

export interface ThemeProductCard {
  imageRadius?: RadiusSize;
  cardRadius?: RadiusSize;
  hoverEffect?: HoverEffect;
  buttonStyle?: "solid" | "outline";
}

export interface ThemeHeader {
  sticky?: boolean;
  transparent?: boolean;
  heightPx?: number;
  logoHeightPx?: number;
  shadow?: ShadowLevel;
  showSearch?: boolean;
  showWishlist?: boolean;
  showCompare?: boolean;
  showAccount?: boolean;
  showCart?: boolean;
  topBar?: {
    enabled?: boolean;
    text?: string;
    phone?: string;
    email?: string;
    showSocialIcons?: boolean;
  };
}

export interface ThemeFooter {
  showCopyright?: boolean;
  copyrightText?: string;
  showPaymentIcons?: boolean;
  showNewsletter?: boolean;
  footerLogo?: string;
  logoHeightPx?: number;
  description?: string;
}

export interface ThemeBanner {
  overlayEnabled?: boolean;
  overlayOpacity?: number;
  textAlign?: "left" | "center" | "right";
  buttonStyle?: "solid" | "outline";
  heightPx?: number;
}

export interface ThemeLayout {
  containerWidthPx?: number;
  gridGapPx?: number;
  sectionPaddingPx?: number;
  sectionMarginPx?: number;
  radius?: RadiusSize;
  shadowLevel?: ShadowLevel;
  animationSpeed?: TransitionSpeed;
}

export interface ThemeDarkMode {
  enabled?: boolean;
}

export interface Theme {
  id: string;
  name: string;
  isActive: boolean;
  siteName?: string;
  companyName?: string;
  shortDescription?: string;
  colors: ThemeColors;
  darkColors: ThemeDarkColors;
  typography: ThemeTypography;
  logos: ThemeLogos;
  buttons: ThemeButtons;
  cards: ThemeCards;
  productCard: ThemeProductCard;
  header: ThemeHeader;
  footer: ThemeFooter;
  banner: ThemeBanner;
  layout: ThemeLayout;
  darkMode: ThemeDarkMode;
  createdAt?: number;
  updatedAt?: number;
}

/** Shape accepted by createTheme/updateTheme - everything but id/timestamps, which the server controls. */
export type ThemeInput = Omit<Theme, "id" | "createdAt" | "updatedAt">;
