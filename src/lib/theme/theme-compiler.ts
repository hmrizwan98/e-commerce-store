import type { SystemThemeConfig } from "./theme-types";
import type { Theme, RadiusSize, ShadowLevel, TransitionSpeed } from "@/types/theme";
import { generateColorScale, isValidHex, SCALE_STEPS } from "./color-scale";
import { DEFAULT_COLOR_FALLBACKS } from "./css-variables";

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

function isSafeRgbTriplet(value: string): boolean {
  return /^\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*$/.test(value);
}

function px(value: number | undefined, fallback: number): string {
  const n = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return `${Math.min(2000, Math.max(0, n))}px`;
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

function hexVar(name: string, value: string | undefined, fallback: string): string {
  const hex = value && isValidHex(value) ? value : fallback;
  return `  --${name}: ${hex};`;
}

/**
 * Compiles a SystemThemeConfig or legacy Theme object into a safe `:root { ... }` CSS string block.
 * All color inputs and dimensions are strictly sanitized to prevent CSS/HTML injection.
 */
export function compileThemeToCssText(theme: SystemThemeConfig | Theme): string {
  const c = theme.colors ?? {};
  const dm = theme.darkMode ?? {};
  const dc = theme.darkColors ?? {};
  const buttons = theme.buttons ?? {};
  const cards = theme.cards ?? {};
  const productCard = theme.productCard ?? {};
  const layout = theme.layout ?? {};
  const typography = theme.typography ?? {};

  const root = `:root {
${scaleVars("primary", c.primary, DEFAULT_COLOR_FALLBACKS.primary)}
${scaleVars("secondary", c.secondary, DEFAULT_COLOR_FALLBACKS.secondary)}
${scaleVars("accent", c.accent, DEFAULT_COLOR_FALLBACKS.accent)}
${hexVar("success", c.success, DEFAULT_COLOR_FALLBACKS.success)}
${hexVar("warning", c.warning, DEFAULT_COLOR_FALLBACKS.warning)}
${hexVar("danger", c.danger, DEFAULT_COLOR_FALLBACKS.danger)}
${hexVar("info", c.info, DEFAULT_COLOR_FALLBACKS.info)}
${hexVar("background", c.background, DEFAULT_COLOR_FALLBACKS.background)}
${hexVar("surface", c.surface, DEFAULT_COLOR_FALLBACKS.surface)}
${hexVar("card", c.card, DEFAULT_COLOR_FALLBACKS.card)}
${hexVar("border", c.border, DEFAULT_COLOR_FALLBACKS.border)}
${hexVar("heading", c.heading, DEFAULT_COLOR_FALLBACKS.heading)}
${hexVar("text", c.text, DEFAULT_COLOR_FALLBACKS.text)}
${hexVar("muted", c.mutedText, DEFAULT_COLOR_FALLBACKS.mutedText)}
${hexVar("header-bg", c.headerBackground, DEFAULT_COLOR_FALLBACKS.headerBackground)}
${hexVar("footer-bg", c.footerBackground, DEFAULT_COLOR_FALLBACKS.footerBackground)}
${hexVar("top-bar-bg", c.topBarBackground, DEFAULT_COLOR_FALLBACKS.topBarBackground)}
${hexVar("btn-bg", c.buttonBackground, c.primary || DEFAULT_COLOR_FALLBACKS.primary)}
${hexVar("btn-hover-bg", c.buttonHoverBackground, c.primary || DEFAULT_COLOR_FALLBACKS.primary)}
${hexVar("btn-text", c.buttonText, DEFAULT_COLOR_FALLBACKS.buttonText)}
${hexVar("link", c.link, DEFAULT_COLOR_FALLBACKS.link)}
${hexVar("link-hover", c.linkHover, DEFAULT_COLOR_FALLBACKS.linkHover)}
${hexVar("badge-sale", c.badgeSale, DEFAULT_COLOR_FALLBACKS.badgeSale)}
${hexVar("badge-new", c.badgeNew, DEFAULT_COLOR_FALLBACKS.badgeNew)}
${hexVar("badge-out-of-stock", c.badgeOutOfStock, DEFAULT_COLOR_FALLBACKS.badgeOutOfStock)}
  --btn-radius: ${RADIUS_MAP[buttons.radius ?? "full"]};
  --btn-shadow: ${SHADOW_MAP[buttons.shadow ?? "xl"]};
  --btn-transition: ${TRANSITION_MAP[buttons.transitionSpeed ?? "normal"]};
  --btn-padding-x: ${px(buttons.paddingX, 24)};
  --btn-padding-y: ${px(buttons.paddingY, 14)};
  --btn-border: ${buttons.border ? "1px solid rgba(0,0,0,0.1)" : "none"};
  --btn-height: ${px(buttons.heightPx, 44)};
  --card-radius: ${RADIUS_MAP[cards.radius ?? "xl"]};
  --card-shadow: ${SHADOW_MAP[cards.shadow ?? "none"]};
  --card-spacing: ${px(cards.spacingPx, 16)};
  --card-border: ${cards.border ? "1px solid var(--border)" : "1px solid transparent"};
  --product-image-radius: ${RADIUS_MAP[productCard.imageRadius ?? "xl"]};
  --product-card-radius: ${RADIUS_MAP[productCard.cardRadius ?? "none"]};
  --container-width: ${px(layout.containerWidthPx, 1280)};
  --grid-gap: ${px(layout.gridGapPx, 24)};
  --section-padding: ${px(layout.sectionPaddingPx, 96)};
  --section-margin: ${px(layout.sectionMarginPx, 96)};
  --animation-speed: ${TRANSITION_MAP[layout.animationSpeed ?? "normal"]};
  --base-font-size: ${px(typography.baseFontSizePx, 16)};
  --line-height: ${typeof typography.lineHeight === "number" ? typography.lineHeight : 1.5};
  --letter-spacing: ${px(typography.letterSpacingPx, 0)};
  --heading-weight: ${typography.headingWeight ?? 600};
  --body-weight: ${typography.bodyWeight ?? 400};
  --button-weight: ${typography.buttonWeight ?? 500};
}`;

  // Dark mode: the primary colour scale is re-generated from darkColors.primary (falls back to
  // the light primary), and the surfaces use the dark colours. Defaults match the storefront's
  // built-in dark look (neutral-900 page, neutral-200 text).
  const darkBlock = dm.enabled
    ? `.dark {
${scaleVars("primary", dc.primary, c.primary || DEFAULT_COLOR_FALLBACKS.primary)}
${hexVar("background", dc.background, "#171717")}
${hexVar("card", dc.card, "#171717")}
${hexVar("text", dc.text, "#e5e5e5")}
${hexVar("header-bg", dc.headerBackground, "#171717")}
${hexVar("footer-bg", dc.footerBackground, "#171717")}
${hexVar("border", dc.border, "#262626")}
}`
    : "";

  // Button overrides only when changed from the defaults the button component was designed
  // with (24px x 14px padding, natural height, weight 500, no border), so an untouched theme
  // renders pixel-identical. Higher specificity than utilities on purpose: a theme change
  // applies to every default-size button.
  const padX = typeof buttons.paddingX === "number" ? buttons.paddingX : 24;
  const padY = typeof buttons.paddingY === "number" ? buttons.paddingY : 14;
  const btnRules: string[] = [];
  if (padX !== 24 || padY !== 14) {
    btnRules.push(
      `.nc-Button.nc-btn-theme-size { padding: ${px(padY - 2, 12)} ${px(Math.round((padX * 2) / 3), 16)}; }`,
      `@media (min-width: 640px) { .nc-Button.nc-btn-theme-size { padding: ${px(padY, 14)} ${px(padX, 24)}; } }`
    );
  }
  if (typeof buttons.heightPx === "number" && buttons.heightPx !== 44) {
    btnRules.push(`.nc-Button.nc-btn-theme-size { min-height: ${px(buttons.heightPx, 44)}; }`);
  }
  const weight = typography.buttonWeight;
  if (weight && weight !== 500 && [400, 500, 600, 700].includes(weight)) {
    btnRules.push(`.nc-Button.nc-btn-theme-weight { font-weight: ${weight}; }`);
  }
  if (buttons.border) {
    btnRules.push(`.ttnc-ButtonPrimary { border: 1px solid rgba(0,0,0,0.1); }`);
  }

  return `${root}\n${darkBlock}${btnRules.length ? `\n${btnRules.join("\n")}` : ""}`;
}
