import type { Theme, RadiusSize, ShadowLevel, TransitionSpeed } from "@/types/theme";
import { generateColorScale, isValidHex, SCALE_STEPS } from "./color-scale";

const RADIUS_MAP: Record<RadiusSize, string> = {
  none: "0px",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1.5rem",
  full: "9999px",
};

const SHADOW_MAP: Record<ShadowLevel, string> = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const TRANSITION_MAP: Record<TransitionSpeed, string> = {
  fast: "100ms",
  normal: "200ms",
  slow: "350ms",
};

/** Rejects anything that isn't a plain "r, g, b" triplet of 0-255 integers - defense against CSS injection via the color-scale generator's output. */
function isSafeRgbTriplet(value: string): boolean {
  return /^\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*$/.test(value);
}

function px(value: number | undefined, fallback: number): string {
  const n = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return `${Math.min(500, Math.max(0, n))}px`;
}

function scaleVars(prefix: string, anchorHex: string | undefined, fallbackHex: string): string {
  const hex = anchorHex && isValidHex(anchorHex) ? anchorHex : fallbackHex;
  const scale = generateColorScale(hex);
  return SCALE_STEPS.map((step) => {
    const triplet = scale[step];
    return isSafeRgbTriplet(triplet) ? `  --c-${prefix}-${step}: ${triplet};` : "";
  })
    .filter(Boolean)
    .join("\n");
}

/** hex -> "r, g, b" for single-value semantic tokens consumed via bg-[var(--x)] arbitrary classes. */
function hexVar(name: string, value: string | undefined, fallback: string): string {
  const hex = value && isValidHex(value) ? value : fallback;
  return `  --${name}: ${hex};`;
}

export const DEFAULT_COLOR_FALLBACKS = {
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
} as const;

const DARK_FALLBACKS = {
  primary: DEFAULT_COLOR_FALLBACKS.primary,
  background: "#0a0a0a",
  card: "#171717",
  text: "#e5e5e5",
  headerBackground: "#171717",
  footerBackground: "#171717",
  border: "#262626",
} as const;

import { compileThemeToCssText } from "./theme-compiler";

/**
 * Produces a `:root { ... }` + `.dark { ... }` CSS text block from a Theme
 * document. Delegated to theme-compiler.ts for theme engine compilation.
 */
export function themeToCssText(theme: any): string {
  return compileThemeToCssText(theme);
}

