/**
 * Theme Customizer Global Settings -> storefront wiring (pure; no Firestore, no browser).
 * Run: npx tsx --test scripts/test-theme-settings.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { compileThemeToCssText } from "../src/lib/theme/theme-compiler";
import { THEME_PRESETS } from "../src/lib/theme/theme-presets";
import { patchNeedsPreviewReload } from "../src/lib/theme/preview-reload";
import { GRID_GAP_SIDEBAR, GRID_GAP_WIDE, themeGridColsClass, themeListingColsClass } from "../src/lib/theme/grid";
import { isLoadableFontKey, LOADABLE_FONT_KEYS } from "../src/lib/theme/font-keys";
import type { SystemThemeConfig } from "../src/lib/theme/theme-types";

const luxury = THEME_PRESETS["premium-luxury"] as SystemThemeConfig;
const minimal = THEME_PRESETS["modern-minimal"] as SystemThemeConfig;
const cssVar = (css: string, name: string) => css.match(new RegExp(`--${name}: ([^;]+);`))?.[1]?.trim();

test("button settings: no override rules at the defaults (pixel-identical), rules when changed", () => {
  const neutral = compileThemeToCssText(luxury);
  assert.doesNotMatch(neutral, /nc-btn-theme-size|nc-btn-theme-weight|\.ttnc-ButtonPrimary \{/);
  const css = compileThemeToCssText({
    ...luxury,
    buttons: { ...luxury.buttons, paddingX: 30, paddingY: 10, heightPx: 52, border: true },
    typography: { ...luxury.typography, buttonWeight: 700 },
  });
  assert.match(css, /\.nc-Button\.nc-btn-theme-size \{ padding: 8px 20px; \}/); // phone: y-2, x*2/3
  assert.match(css, /@media \(min-width: 640px\) \{ \.nc-Button\.nc-btn-theme-size \{ padding: 10px 30px; \} \}/);
  assert.match(css, /\.nc-Button\.nc-btn-theme-size \{ min-height: 52px; \}/);
  assert.match(css, /\.nc-Button\.nc-btn-theme-weight \{ font-weight: 700; \}/);
  assert.match(css, /\.ttnc-ButtonPrimary \{ border: 1px solid/);
  assert.equal(cssVar(css, "btn-padding-x"), "30px");
  assert.equal(cssVar(css, "btn-height"), "52px");
});

test("card settings compile, including the border toggle", () => {
  const on = compileThemeToCssText({ ...luxury, cards: { ...luxury.cards, border: true, spacingPx: 20, shadow: "md", radius: "lg" } });
  assert.equal(cssVar(on, "card-border"), "1px solid var(--border)");
  assert.equal(cssVar(on, "card-spacing"), "20px");
  assert.equal(cssVar(on, "card-radius"), "0.75rem");
  assert.match(cssVar(on, "card-shadow") ?? "", /rgba/);
  const off = compileThemeToCssText({ ...luxury, cards: { ...luxury.cards, border: false } });
  assert.equal(cssVar(off, "card-border"), "1px solid transparent");
});

test("typography and layout values compile", () => {
  const css = compileThemeToCssText({
    ...luxury,
    typography: { ...luxury.typography, baseFontSizePx: 18, lineHeight: 1.7, bodyWeight: 500 },
    layout: { ...luxury.layout, containerWidthPx: 1440, gridGapPx: 32, sectionPaddingPx: 64, sectionMarginPx: 80 },
  });
  assert.equal(cssVar(css, "base-font-size"), "18px");
  assert.equal(cssVar(css, "line-height"), "1.7");
  assert.equal(cssVar(css, "body-weight"), "500");
  assert.equal(cssVar(css, "container-width"), "1440px");
  assert.equal(cssVar(css, "grid-gap"), "32px");
  assert.equal(cssVar(css, "section-padding"), "64px");
  assert.equal(cssVar(css, "section-margin"), "80px");
});

test("dark mode: block only when enabled; dark primary drives the primary scale", () => {
  const off = compileThemeToCssText({ ...luxury, darkMode: { enabled: false } });
  assert.doesNotMatch(off, /\.dark \{/);
  const on = compileThemeToCssText({ ...luxury, darkMode: { enabled: true }, darkColors: { ...luxury.darkColors, primary: "#ff0000" } });
  const dark = on.slice(on.indexOf(".dark {"));
  assert.match(dark, /--c-primary-500: /);
  assert.match(dark, /--background: #171717;/);
  assert.doesNotMatch(dark, /c-primary-600-override/);
});

test("unsafe colour input never reaches CSS", () => {
  const css = compileThemeToCssText({ ...luxury, colors: { ...luxury.colors, background: "red;}</style><script>" } });
  assert.doesNotMatch(css, /script/);
  assert.equal(cssVar(css, "background"), "#ffffff");
});

test("Default Theme presets keep today's storefront look with the newly wired settings", () => {
  for (const p of [luxury, minimal]) {
    assert.equal(p.typography.lineHeight, 1.5, `${p.presetId} line height = old text-base 1.5`);
    assert.equal(p.buttons.paddingX, 24, `${p.presetId} button padding x = old px-6`);
    assert.equal(p.buttons.paddingY, 14, `${p.presetId} button padding y = old py-3.5`);
    assert.equal(p.buttons.border, false, `${p.presetId} no button border`);
    assert.equal(p.buttons.heightPx, 44, `${p.presetId} button min-height <= natural height`);
    assert.equal(p.layout.containerWidthPx, 1280);
    assert.equal(p.layout.gridGapPx, 24);
    assert.equal(p.layout.sectionPaddingPx, 96);
    assert.equal(p.layout.sectionMarginPx, 96);
    assert.equal(p.cards.applyToProductCards ?? false, false, "card overrides are opt-in");
    assert.equal(p.darkColors?.background, "#171717");
    assert.equal(p.darkColors?.primary, p.colors.primary);
  }
  assert.equal(luxury.typography.headingFont, luxury.typography.bodyFont, "headings looked like the body font before the font fix");
});

test("the presets are never mutated by a resolver (deep copies)", () => {
  const before = JSON.stringify(THEME_PRESETS["premium-luxury"]);
  compileThemeToCssText(THEME_PRESETS["premium-luxury"] as SystemThemeConfig);
  assert.equal(JSON.stringify(THEME_PRESETS["premium-luxury"]), before);
});

test("preview reload: CSS-only edits update live, component edits reload", () => {
  assert.equal(patchNeedsPreviewReload({ colors: { primary: "#000000" } }), false);
  assert.equal(patchNeedsPreviewReload({ typography: { lineHeight: 1.6 } }), false);
  assert.equal(patchNeedsPreviewReload({ buttons: { paddingX: 20 } }), false);
  assert.equal(patchNeedsPreviewReload({ cards: { applyToProductCards: true } }), false);
  assert.equal(patchNeedsPreviewReload({ darkMode: { enabled: true } }), false);
  assert.equal(patchNeedsPreviewReload({ productCard: { imageRadius: "lg" } } as never), false);
  assert.equal(patchNeedsPreviewReload({ productCard: { variant: "minimal" } } as never), true);
  assert.equal(patchNeedsPreviewReload({ collection: { gridColumnsDesktop: 4 } }), true);
  assert.equal(patchNeedsPreviewReload({ popup: { enabled: true } }), true);
  assert.equal(patchNeedsPreviewReload({ cart: { itemLayout: "compact" } }), true);
  assert.equal(patchNeedsPreviewReload({ presetId: "modern-minimal" } as never), true);
});

test("grid columns and gaps", () => {
  assert.equal(themeGridColsClass(3, 2), "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3");
  assert.equal(themeGridColsClass(5, 1), "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5");
  // Listings keep their own 2/3/4 layout until the admin sets columns explicitly.
  assert.equal(themeListingColsClass(undefined), "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4");
  assert.equal(themeListingColsClass({ gridColumnsDesktop: 2 }), "grid-cols-2 sm:grid-cols-2 lg:grid-cols-2");
  // Default 24px reproduces the old gap-x-6 gap-y-8 / gap-x-8 gap-y-10 exactly.
  assert.match(GRID_GAP_SIDEBAR, /gap-x-\[var\(--grid-gap,24px\)\]/);
  assert.match(GRID_GAP_WIDE, /\+_8px/);
});

test("fonts: CSS var names match next/font declarations; branding font is validated", () => {
  const src = fs.readFileSync("src/lib/theme/fonts.ts", "utf8") + fs.readFileSync("src/lib/theme/default-font.ts", "utf8");
  const declared = new Set(Array.from(src.matchAll(/variable: "(--font-[a-z-]+)"/g)).map((m) => m[1]));
  const used = Array.from(src.matchAll(/cssVar: "(--font-[a-z-]+)"/g)).map((m) => m[1]);
  assert.equal(used.length, LOADABLE_FONT_KEYS.length);
  for (const v of used) assert.ok(declared.has(v), `${v} is declared by next/font`);
  // The layout must reference the CSS variable NAME, never next/font's generated class.
  const layout = fs.readFileSync("src/app/layout.tsx", "utf8");
  assert.match(layout, /var\(\$\{bodyFont\.cssVar\}\)/);
  assert.doesNotMatch(layout, /var\(\$\{bodyFont\.variable\}\)/);
  assert.equal(isLoadableFontKey("inter"), true);
  assert.equal(isLoadableFontKey("Inter"), false);
  assert.equal(isLoadableFontKey("Comic Sans"), false);
});
