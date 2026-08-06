import "server-only";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData } from "./utils";
import type { Theme } from "@/types/theme";

const COLLECTION = "themes";

/**
 * Reproduces today's exact hardcoded look (same hex codes as
 * __theme_colors.scss, rounded-full buttons, Poppins font, sticky solid
 * header) - returned whenever no theme doc is marked active, so the site
 * never changes visually until an admin actually publishes a different theme.
 */
export const DEFAULT_THEME: Theme = {
  id: "__default__",
  name: "Default Theme",
  isActive: true,
  colors: {
    primary: "#0284c7",
    secondary: "#16a34a",
    accent: "#7c3aed",
    success: "#16a34a",
    warning: "#eab308",
    danger: "#dc2626",
    info: "#2563eb",
    background: "#ffffff",
    surface: "#f8fafc",
    card: "#ffffff",
    border: "#e5e7eb",
    heading: "#111827",
    text: "#111827",
    mutedText: "#6b7280",
    headerBackground: "#ffffff",
    footerBackground: "#ffffff",
    topBarBackground: "#111827",
    buttonBackground: "#0f172a",
    buttonHoverBackground: "#1e293b",
    buttonText: "#f8fafc",
    link: "#0284c7",
    linkHover: "#0369a1",
    badgeSale: "#dc2626",
    badgeNew: "#0284c7",
    badgeOutOfStock: "#6b7280",
  },
  darkColors: {
    primary: "#0284c7",
    background: "#0a0a0a",
    card: "#171717",
    text: "#e5e5e5",
    headerBackground: "#171717",
    footerBackground: "#171717",
    border: "#262626",
  },
  typography: {
    headingFont: "poppins",
    bodyFont: "poppins",
    baseFontSizePx: 16,
    lineHeight: 1.5,
    letterSpacingPx: 0,
    headingWeight: 600,
    bodyWeight: 400,
    buttonWeight: 500,
  },
  logos: {},
  buttons: {
    radius: "full",
    heightPx: 48,
    shadow: "xl",
    hoverEffect: "none",
    border: false,
    paddingX: 24,
    paddingY: 14,
    transitionSpeed: "normal",
  },
  cards: {
    radius: "xl",
    shadow: "none",
    border: false,
    hoverEffect: "none",
    spacingPx: 16,
    background: "#ffffff",
  },
  productCard: {
    imageRadius: "xl",
    cardRadius: "none",
    hoverEffect: "none",
    buttonStyle: "solid",
  },
  header: {
    sticky: true,
    transparent: false,
    heightPx: 80,
    shadow: "none",
    showSearch: true,
    showWishlist: true,
    showCompare: true,
    showAccount: true,
    showCart: true,
    topBar: { enabled: false, showSocialIcons: true },
  },
  footer: {
    showCopyright: true,
    copyrightText: "",
    showPaymentIcons: false,
    showNewsletter: false,
  },
  banner: {
    overlayEnabled: false,
    overlayOpacity: 0,
    textAlign: "left",
    buttonStyle: "solid",
  },
  layout: {
    containerWidthPx: 1280,
    gridGapPx: 24,
    sectionPaddingPx: 96,
    sectionMarginPx: 96,
    radius: "xl",
    shadowLevel: "none",
    animationSpeed: "normal",
  },
  darkMode: { enabled: false },
};

export async function getActiveTheme(): Promise<Theme> {
  const col = await tenantCollection(COLLECTION);
  const snap = await col.where("isActive", "==", true).limit(1).get();
  if (snap.empty) return DEFAULT_THEME;
  const theme = docData<Theme>(snap.docs[0]);
  return theme ?? DEFAULT_THEME;
}

export async function getThemeById(id: string): Promise<Theme | null> {
  if (id === DEFAULT_THEME.id) return DEFAULT_THEME;
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc(id).get();
  return docData<Theme>(doc);
}

export async function getAllThemesForAdmin(): Promise<Theme[]> {
  const col = await tenantCollection(COLLECTION);
  const snap = await col.orderBy("createdAt", "asc").get();
  const themes = snap.docs.map((doc) => docData<Theme>(doc)).filter((t): t is Theme => t !== null);
  if (!themes.some((t) => t.isActive)) return [DEFAULT_THEME, ...themes];
  return themes;
}
