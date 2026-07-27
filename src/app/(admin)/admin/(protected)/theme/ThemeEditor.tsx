"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { HexColorPicker } from "react-colorful";
import ImageUploader from "@/components/admin/ImageUploader";
import { createTheme, updateTheme, deleteTheme, duplicateTheme, setActiveTheme } from "./actions";
import { themeToCssText } from "@/lib/theme/css-variables";
import { isValidHex } from "@/lib/theme/color-scale";
import { FONT_KEYS, FONT_PRESETS } from "@/lib/theme/fonts";
import type {
  Theme,
  ThemeInput,
  ThemeColors,
  ThemeDarkColors,
  ThemeTypography,
  ThemeLogos,
  ThemeButtons,
  ThemeCards,
  ThemeProductCard,
  ThemeHeader,
  ThemeFooter,
  ThemeBanner,
  ThemeLayout,
  ThemeDarkMode,
  RadiusSize,
  ShadowLevel,
  HoverEffect,
  TransitionSpeed,
} from "@/types/theme";

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
const labelClass = "block text-sm font-medium mb-1";
const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";
const sectionTitleClass = "text-sm font-semibold text-neutral-500 uppercase tracking-wide";

const RADIUS_OPTIONS: RadiusSize[] = ["none", "sm", "md", "lg", "xl", "full"];
const SHADOW_OPTIONS: ShadowLevel[] = ["none", "sm", "md", "lg", "xl"];
const HOVER_OPTIONS: HoverEffect[] = ["none", "lift", "scale", "glow"];
const TRANSITION_OPTIONS: TransitionSpeed[] = ["fast", "normal", "slow"];
const HEADING_WEIGHT_OPTIONS = [400, 500, 600, 700, 800] as const;
const BODY_WEIGHT_OPTIONS = [400, 500, 600] as const;
const BUTTON_WEIGHT_OPTIONS = [400, 500, 600, 700] as const;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function collectHexIssues(theme: Theme): string[] {
  const issues: string[] = [];
  const colors = theme.colors ?? {};
  (Object.keys(colors) as (keyof ThemeColors)[]).forEach((key) => {
    const v = colors[key];
    if (v && v.trim() !== "" && !isValidHex(v)) issues.push(`colors.${key}`);
  });
  const darkColors = theme.darkColors ?? {};
  (Object.keys(darkColors) as (keyof ThemeDarkColors)[]).forEach((key) => {
    const v = darkColors[key];
    if (v && v.trim() !== "" && !isValidHex(v)) issues.push(`darkColors.${key}`);
  });
  if (theme.cards?.background && theme.cards.background.trim() !== "" && !isValidHex(theme.cards.background)) {
    issues.push("cards.background");
  }
  return issues;
}

function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string | undefined;
  onChange: (hex: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const trimmed = (value ?? "").trim();
  const invalid = trimmed !== "" && !isValidHex(trimmed);
  const swatch = trimmed !== "" && isValidHex(trimmed) ? trimmed : "#e5e7eb";

  return (
    <div ref={ref} className="relative">
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className="w-9 h-9 rounded-lg border border-neutral-300 dark:border-neutral-700 flex-shrink-0 disabled:opacity-50"
          style={{ backgroundColor: swatch }}
          aria-label={`Pick ${label} color`}
        />
        <input
          className={`${inputClass} font-mono text-xs`}
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
        />
      </div>
      {open && !disabled && (
        <div className="absolute z-20 mt-1">
          <HexColorPicker color={swatch} onChange={onChange} />
        </div>
      )}
      {invalid && <p className="text-xs text-red-600 mt-1">Enter a valid hex color, e.g. #0284c7</p>}
    </div>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  labelMap,
}: {
  label: string;
  value: T | undefined;
  options: readonly T[];
  onChange: (value: T) => void;
  labelMap?: Record<string, string>;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select className={inputClass} value={value ?? options[0]} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {labelMap?.[opt] ?? capitalize(opt)}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  step,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  suffix?: string;
  step?: number;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {suffix ? ` (${suffix})` : ""}
      </label>
      <input
        type="number"
        step={step}
        className={inputClass}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    </div>
  );
}

function NumberSelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number | undefined;
  options: readonly number[];
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select className={inputClass} value={value ?? options[0]} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean | undefined;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-center gap-2 text-sm ${disabled ? "opacity-50" : ""}`}>
      <input type="checkbox" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function BrandTab({
  theme,
  onFieldChange,
  onLogosChange,
  onUploadingChange,
}: {
  theme: Theme;
  onFieldChange: (patch: Partial<Pick<Theme, "name" | "siteName" | "companyName" | "shortDescription">>) => void;
  onLogosChange: (patch: Partial<ThemeLogos>) => void;
  onUploadingChange: (key: string, uploading: boolean) => void;
}) {
  const logos = theme.logos ?? {};
  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Brand</h3>
        <div>
          <label className={labelClass}>Theme name</label>
          <input className={inputClass} value={theme.name} onChange={(e) => onFieldChange({ name: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Website / site name</label>
          <input
            className={inputClass}
            value={theme.siteName ?? ""}
            onChange={(e) => onFieldChange({ siteName: e.target.value })}
            placeholder="e.g. Acme Store"
          />
        </div>
        <div>
          <label className={labelClass}>Company name</label>
          <input
            className={inputClass}
            value={theme.companyName ?? ""}
            onChange={(e) => onFieldChange({ companyName: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Short description</label>
          <textarea
            className={inputClass}
            rows={2}
            value={theme.shortDescription ?? ""}
            onChange={(e) => onFieldChange({ shortDescription: e.target.value })}
          />
        </div>
      </div>

      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Logos & icons</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <ImageUploader
            value={logos.logoLight ? [logos.logoLight] : []}
            onChange={(urls) => onLogosChange({ logoLight: urls[0] })}
            imageType="themeLogo"
            subfolder="logo"
            multiple={false}
            label="Logo (Light)"
            onUploadingChange={(u) => onUploadingChange("logoLight", u)}
          />
          <ImageUploader
            value={logos.logoDark ? [logos.logoDark] : []}
            onChange={(urls) => onLogosChange({ logoDark: urls[0] })}
            imageType="themeLogo"
            subfolder="logo"
            multiple={false}
            label="Logo (Dark)"
            onUploadingChange={(u) => onUploadingChange("logoDark", u)}
          />
          <ImageUploader
            value={logos.favicon ? [logos.favicon] : []}
            onChange={(urls) => onLogosChange({ favicon: urls[0] })}
            imageType="themeFavicon"
            subfolder="favicon"
            multiple={false}
            label="Favicon"
            onUploadingChange={(u) => onUploadingChange("favicon", u)}
          />
          <ImageUploader
            value={logos.appleTouchIcon ? [logos.appleTouchIcon] : []}
            onChange={(urls) => onLogosChange({ appleTouchIcon: urls[0] })}
            imageType="themeIcon"
            subfolder="icon"
            multiple={false}
            label="Apple Touch Icon"
            onUploadingChange={(u) => onUploadingChange("appleTouchIcon", u)}
          />
          <ImageUploader
            value={logos.loadingLogo ? [logos.loadingLogo] : []}
            onChange={(urls) => onLogosChange({ loadingLogo: urls[0] })}
            imageType="themeLogo"
            subfolder="logo"
            multiple={false}
            label="Loading Logo"
            onUploadingChange={(u) => onUploadingChange("loadingLogo", u)}
          />
          <ImageUploader
            value={logos.footerLogo ? [logos.footerLogo] : []}
            onChange={(urls) => onLogosChange({ footerLogo: urls[0] })}
            imageType="themeLogo"
            subfolder="logo"
            multiple={false}
            label="Footer Logo"
            onUploadingChange={(u) => onUploadingChange("footerLogo", u)}
          />
        </div>
      </div>
    </div>
  );
}

const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
  success: "Success",
  warning: "Warning",
  danger: "Danger",
  info: "Info",
  background: "Background",
  surface: "Surface",
  card: "Card",
  border: "Border",
  heading: "Heading",
  text: "Text",
  mutedText: "Muted text",
  headerBackground: "Header background",
  footerBackground: "Footer background",
  topBarBackground: "Top bar background",
  buttonBackground: "Button background",
  buttonHoverBackground: "Button hover background",
  buttonText: "Button text",
  link: "Link",
  linkHover: "Link hover",
  badgeSale: "Sale badge",
  badgeNew: "New badge",
  badgeOutOfStock: "Out of stock badge",
};

const COLOR_GROUPS: { title: string; fields: (keyof ThemeColors)[] }[] = [
  { title: "Brand", fields: ["primary", "secondary", "accent", "success", "warning", "danger", "info"] },
  { title: "Surfaces", fields: ["background", "surface", "card", "border"] },
  { title: "Text", fields: ["heading", "text", "mutedText"] },
  { title: "Header/Footer", fields: ["headerBackground", "footerBackground", "topBarBackground"] },
  { title: "Buttons", fields: ["buttonBackground", "buttonHoverBackground", "buttonText"] },
  { title: "Links", fields: ["link", "linkHover"] },
  { title: "Badges", fields: ["badgeSale", "badgeNew", "badgeOutOfStock"] },
];

function ColorsTab({ colors, onChange }: { colors: ThemeColors; onChange: (patch: Partial<ThemeColors>) => void }) {
  return (
    <div className="space-y-6">
      {COLOR_GROUPS.map((group) => (
        <div key={group.title} className={cardClass}>
          <h3 className={sectionTitleClass}>{group.title}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {group.fields.map((field) => (
              <ColorField
                key={field}
                label={COLOR_LABELS[field]}
                value={colors[field]}
                onChange={(hex) => onChange({ [field]: hex })}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TypographyTab({
  typography,
  onChange,
}: {
  typography: ThemeTypography;
  onChange: (patch: Partial<ThemeTypography>) => void;
}) {
  const fontLabelMap = Object.fromEntries(FONT_KEYS.map((k) => [k, FONT_PRESETS[k].label])) as Record<string, string>;
  return (
    <div className={cardClass}>
      <h3 className={sectionTitleClass}>Typography</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <SelectField
          label="Heading font"
          value={typography.headingFont}
          options={FONT_KEYS}
          onChange={(v) => onChange({ headingFont: v })}
          labelMap={fontLabelMap}
        />
        <SelectField
          label="Body font"
          value={typography.bodyFont}
          options={FONT_KEYS}
          onChange={(v) => onChange({ bodyFont: v })}
          labelMap={fontLabelMap}
        />
        <NumberField
          label="Base font size"
          suffix="px"
          value={typography.baseFontSizePx}
          onChange={(v) => onChange({ baseFontSizePx: v })}
        />
        <NumberField
          label="Line height"
          step={0.05}
          value={typography.lineHeight}
          onChange={(v) => onChange({ lineHeight: v })}
        />
        <NumberField
          label="Letter spacing"
          suffix="px"
          value={typography.letterSpacingPx}
          onChange={(v) => onChange({ letterSpacingPx: v })}
        />
        <NumberSelectField
          label="Heading weight"
          value={typography.headingWeight}
          options={HEADING_WEIGHT_OPTIONS}
          onChange={(v) => onChange({ headingWeight: v as ThemeTypography["headingWeight"] })}
        />
        <NumberSelectField
          label="Body weight"
          value={typography.bodyWeight}
          options={BODY_WEIGHT_OPTIONS}
          onChange={(v) => onChange({ bodyWeight: v as ThemeTypography["bodyWeight"] })}
        />
        <NumberSelectField
          label="Button weight"
          value={typography.buttonWeight}
          options={BUTTON_WEIGHT_OPTIONS}
          onChange={(v) => onChange({ buttonWeight: v as ThemeTypography["buttonWeight"] })}
        />
      </div>
    </div>
  );
}

function HeaderTab({
  header,
  onChange,
  onTopBarChange,
}: {
  header: ThemeHeader;
  onChange: (patch: Partial<ThemeHeader>) => void;
  onTopBarChange: (patch: Partial<NonNullable<ThemeHeader["topBar"]>>) => void;
}) {
  const topBar = header.topBar ?? {};
  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Header</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <CheckboxField label="Sticky header" checked={header.sticky} onChange={(v) => onChange({ sticky: v })} />
          <CheckboxField
            label="Transparent header"
            checked={header.transparent}
            onChange={(v) => onChange({ transparent: v })}
          />
          <NumberField label="Height" suffix="px" value={header.heightPx} onChange={(v) => onChange({ heightPx: v })} />
          <SelectField
            label="Shadow"
            value={header.shadow}
            options={SHADOW_OPTIONS}
            onChange={(v) => onChange({ shadow: v })}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <CheckboxField
            label="Show search"
            checked={header.showSearch}
            onChange={(v) => onChange({ showSearch: v })}
          />
          <CheckboxField
            label="Show wishlist"
            checked={header.showWishlist}
            onChange={(v) => onChange({ showWishlist: v })}
          />
          <CheckboxField
            label="Show compare"
            checked={header.showCompare}
            onChange={(v) => onChange({ showCompare: v })}
          />
          <CheckboxField
            label="Show account"
            checked={header.showAccount}
            onChange={(v) => onChange({ showAccount: v })}
          />
          <CheckboxField label="Show cart" checked={header.showCart} onChange={(v) => onChange({ showCart: v })} />
        </div>
      </div>
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Top bar</h3>
        <CheckboxField
          label="Enable top bar"
          checked={topBar.enabled}
          onChange={(v) => onTopBarChange({ enabled: v })}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Text</label>
            <input
              className={inputClass}
              value={topBar.text ?? ""}
              onChange={(e) => onTopBarChange({ text: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              className={inputClass}
              value={topBar.phone ?? ""}
              onChange={(e) => onTopBarChange({ phone: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              className={inputClass}
              value={topBar.email ?? ""}
              onChange={(e) => onTopBarChange({ email: e.target.value })}
            />
          </div>
          <CheckboxField
            label="Show social icons"
            checked={topBar.showSocialIcons}
            onChange={(v) => onTopBarChange({ showSocialIcons: v })}
          />
        </div>
      </div>
    </div>
  );
}

function FooterTab({ footer, onChange }: { footer: ThemeFooter; onChange: (patch: Partial<ThemeFooter>) => void }) {
  return (
    <div className={cardClass}>
      <h3 className={sectionTitleClass}>Footer</h3>
      <CheckboxField
        label="Show copyright"
        checked={footer.showCopyright}
        onChange={(v) => onChange({ showCopyright: v })}
      />
      <div>
        <label className={labelClass}>Copyright text</label>
        <input
          className={inputClass}
          value={footer.copyrightText ?? ""}
          onChange={(e) => onChange({ copyrightText: e.target.value })}
          placeholder={`© ${new Date().getFullYear()} Your Store. All rights reserved.`}
        />
      </div>
      <CheckboxField
        label="Show payment icons"
        checked={footer.showPaymentIcons}
        onChange={(v) => onChange({ showPaymentIcons: v })}
      />
      <CheckboxField
        label="Show newsletter signup"
        checked={footer.showNewsletter}
        onChange={(v) => onChange({ showNewsletter: v })}
      />
    </div>
  );
}

function ButtonsCardsTab({
  buttons,
  cards,
  onButtonsChange,
  onCardsChange,
}: {
  buttons: ThemeButtons;
  cards: ThemeCards;
  onButtonsChange: (patch: Partial<ThemeButtons>) => void;
  onCardsChange: (patch: Partial<ThemeCards>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Buttons</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField
            label="Radius"
            value={buttons.radius}
            options={RADIUS_OPTIONS}
            onChange={(v) => onButtonsChange({ radius: v })}
          />
          <SelectField
            label="Shadow"
            value={buttons.shadow}
            options={SHADOW_OPTIONS}
            onChange={(v) => onButtonsChange({ shadow: v })}
          />
          <SelectField
            label="Hover effect"
            value={buttons.hoverEffect}
            options={HOVER_OPTIONS}
            onChange={(v) => onButtonsChange({ hoverEffect: v })}
          />
          <SelectField
            label="Transition speed"
            value={buttons.transitionSpeed}
            options={TRANSITION_OPTIONS}
            onChange={(v) => onButtonsChange({ transitionSpeed: v })}
          />
          <NumberField
            label="Height"
            suffix="px"
            value={buttons.heightPx}
            onChange={(v) => onButtonsChange({ heightPx: v })}
          />
          <NumberField
            label="Padding X"
            suffix="px"
            value={buttons.paddingX}
            onChange={(v) => onButtonsChange({ paddingX: v })}
          />
          <NumberField
            label="Padding Y"
            suffix="px"
            value={buttons.paddingY}
            onChange={(v) => onButtonsChange({ paddingY: v })}
          />
          <CheckboxField label="Border" checked={buttons.border} onChange={(v) => onButtonsChange({ border: v })} />
        </div>
      </div>
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Cards</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField
            label="Radius"
            value={cards.radius}
            options={RADIUS_OPTIONS}
            onChange={(v) => onCardsChange({ radius: v })}
          />
          <SelectField
            label="Shadow"
            value={cards.shadow}
            options={SHADOW_OPTIONS}
            onChange={(v) => onCardsChange({ shadow: v })}
          />
          <SelectField
            label="Hover effect"
            value={cards.hoverEffect}
            options={HOVER_OPTIONS}
            onChange={(v) => onCardsChange({ hoverEffect: v })}
          />
          <NumberField
            label="Spacing"
            suffix="px"
            value={cards.spacingPx}
            onChange={(v) => onCardsChange({ spacingPx: v })}
          />
          <CheckboxField label="Border" checked={cards.border} onChange={(v) => onCardsChange({ border: v })} />
        </div>
        <ColorField label="Background" value={cards.background} onChange={(hex) => onCardsChange({ background: hex })} />
      </div>
    </div>
  );
}

function ProductCardTab({
  productCard,
  onChange,
}: {
  productCard: ThemeProductCard;
  onChange: (patch: Partial<ThemeProductCard>) => void;
}) {
  return (
    <div className={cardClass}>
      <h3 className={sectionTitleClass}>Product card</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <SelectField
          label="Image radius"
          value={productCard.imageRadius}
          options={RADIUS_OPTIONS}
          onChange={(v) => onChange({ imageRadius: v })}
        />
        <SelectField
          label="Card radius"
          value={productCard.cardRadius}
          options={RADIUS_OPTIONS}
          onChange={(v) => onChange({ cardRadius: v })}
        />
        <SelectField
          label="Hover effect"
          value={productCard.hoverEffect}
          options={HOVER_OPTIONS}
          onChange={(v) => onChange({ hoverEffect: v })}
        />
        <SelectField
          label="Button style"
          value={productCard.buttonStyle}
          options={["solid", "outline"] as const}
          onChange={(v) => onChange({ buttonStyle: v })}
        />
      </div>
    </div>
  );
}

function BannersTab({ banner, onChange }: { banner: ThemeBanner; onChange: (patch: Partial<ThemeBanner>) => void }) {
  return (
    <div className={cardClass}>
      <h3 className={sectionTitleClass}>Banners</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <CheckboxField
          label="Enable overlay"
          checked={banner.overlayEnabled}
          onChange={(v) => onChange({ overlayEnabled: v })}
        />
        <NumberField label="Height" suffix="px" value={banner.heightPx} onChange={(v) => onChange({ heightPx: v })} />
        <SelectField
          label="Text alignment"
          value={banner.textAlign}
          options={["left", "center", "right"] as const}
          onChange={(v) => onChange({ textAlign: v })}
        />
        <SelectField
          label="Button style"
          value={banner.buttonStyle}
          options={["solid", "outline"] as const}
          onChange={(v) => onChange({ buttonStyle: v })}
        />
      </div>
      <div>
        <label className={labelClass}>Overlay opacity ({Math.round((banner.overlayOpacity ?? 0) * 100)}%)</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={banner.overlayOpacity ?? 0}
          onChange={(e) => onChange({ overlayOpacity: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}

function LayoutTab({ layout, onChange }: { layout: ThemeLayout; onChange: (patch: Partial<ThemeLayout>) => void }) {
  return (
    <div className={cardClass}>
      <h3 className={sectionTitleClass}>Layout</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NumberField
          label="Container width"
          suffix="px"
          value={layout.containerWidthPx}
          onChange={(v) => onChange({ containerWidthPx: v })}
        />
        <NumberField label="Grid gap" suffix="px" value={layout.gridGapPx} onChange={(v) => onChange({ gridGapPx: v })} />
        <NumberField
          label="Section padding"
          suffix="px"
          value={layout.sectionPaddingPx}
          onChange={(v) => onChange({ sectionPaddingPx: v })}
        />
        <NumberField
          label="Section margin"
          suffix="px"
          value={layout.sectionMarginPx}
          onChange={(v) => onChange({ sectionMarginPx: v })}
        />
        <SelectField
          label="Radius"
          value={layout.radius}
          options={RADIUS_OPTIONS}
          onChange={(v) => onChange({ radius: v })}
        />
        <SelectField
          label="Shadow level"
          value={layout.shadowLevel}
          options={SHADOW_OPTIONS}
          onChange={(v) => onChange({ shadowLevel: v })}
        />
        <SelectField
          label="Animation speed"
          value={layout.animationSpeed}
          options={TRANSITION_OPTIONS}
          onChange={(v) => onChange({ animationSpeed: v })}
        />
      </div>
    </div>
  );
}

const DARK_COLOR_LABELS: Record<keyof ThemeDarkColors, string> = {
  primary: "Primary",
  background: "Background",
  card: "Card",
  text: "Text",
  headerBackground: "Header background",
  footerBackground: "Footer background",
  border: "Border",
};

function DarkModeTab({
  darkMode,
  darkColors,
  onModeChange,
  onColorsChange,
}: {
  darkMode: ThemeDarkMode;
  darkColors: ThemeDarkColors;
  onModeChange: (patch: Partial<ThemeDarkMode>) => void;
  onColorsChange: (patch: Partial<ThemeDarkColors>) => void;
}) {
  const enabled = !!darkMode.enabled;
  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <CheckboxField
          label="Enable dark mode support"
          checked={enabled}
          onChange={(v) => onModeChange({ enabled: v })}
        />
      </div>
      <div className={`${cardClass} ${enabled ? "" : "opacity-50 pointer-events-none"}`}>
        <h3 className={sectionTitleClass}>Dark mode colors</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(Object.keys(DARK_COLOR_LABELS) as (keyof ThemeDarkColors)[]).map((field) => (
            <ColorField
              key={field}
              label={DARK_COLOR_LABELS[field]}
              value={darkColors[field]}
              disabled={!enabled}
              onChange={(hex) => onColorsChange({ [field]: hex })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PresetsTab({
  themes,
  activeId,
  currentThemeId,
  busyId,
  creating,
  onSetActive,
  onDuplicate,
  onDelete,
  onExport,
  onSelect,
  onCreateNew,
  onImportClick,
}: {
  themes: Theme[];
  activeId: string;
  currentThemeId: string;
  busyId: string | null;
  creating: boolean;
  onSetActive: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (theme: Theme) => void;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  onImportClick: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className={sectionTitleClass}>All themes</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onImportClick}
            className="px-4 py-2 text-sm rounded-full border border-neutral-300 dark:border-neutral-700"
          >
            Import theme
          </button>
          <button
            type="button"
            onClick={onCreateNew}
            disabled={creating}
            className="px-4 py-2 text-sm rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
          >
            {creating ? "Creating…" : "+ New theme"}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {themes.map((t) => (
          <div
            key={t.id}
            className={`flex items-center justify-between gap-3 p-4 rounded-2xl border bg-white dark:bg-neutral-900 ${
              t.id === currentThemeId
                ? "border-primary-400"
                : "border-neutral-200 dark:border-neutral-800"
            }`}
          >
            <button type="button" onClick={() => onSelect(t.id)} className="flex items-center gap-2 text-left flex-1 min-w-0">
              <span className="font-medium truncate">{t.name}</span>
              {t.id === activeId && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 flex-shrink-0">
                  Active
                </span>
              )}
            </button>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => onSetActive(t.id)}
                disabled={t.id === activeId || busyId === t.id}
                className="px-3 py-1.5 text-xs rounded-full border border-neutral-300 dark:border-neutral-700 disabled:opacity-50"
              >
                Set active
              </button>
              <button
                type="button"
                onClick={() => onDuplicate(t.id)}
                disabled={busyId === t.id}
                className="px-3 py-1.5 text-xs rounded-full border border-neutral-300 dark:border-neutral-700 disabled:opacity-50"
              >
                Duplicate
              </button>
              <button
                type="button"
                onClick={() => onExport(t)}
                className="px-3 py-1.5 text-xs rounded-full border border-neutral-300 dark:border-neutral-700"
              >
                Export
              </button>
              <button
                type="button"
                onClick={() => onDelete(t.id)}
                disabled={t.id === activeId || busyId === t.id}
                className="px-3 py-1.5 text-xs rounded-full border border-red-300 text-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!themes.length && (
          <div className="text-center py-12 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl">
            <p className="text-sm text-neutral-500">No themes yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

type TabKey =
  | "brand"
  | "colors"
  | "typography"
  | "header"
  | "footer"
  | "buttons"
  | "productCard"
  | "banners"
  | "layout"
  | "darkMode"
  | "presets";

const TABS: { key: TabKey; label: string }[] = [
  { key: "brand", label: "Brand Identity" },
  { key: "colors", label: "Colors" },
  { key: "typography", label: "Typography" },
  { key: "header", label: "Header" },
  { key: "footer", label: "Footer" },
  { key: "buttons", label: "Buttons & Cards" },
  { key: "productCard", label: "Product Card" },
  { key: "banners", label: "Banners" },
  { key: "layout", label: "Layout" },
  { key: "darkMode", label: "Dark Mode" },
  { key: "presets", label: "Presets" },
];

const ThemeEditor: React.FC<{ themes: Theme[]; activeThemeId: string; defaultTheme: Theme }> = ({
  themes: initialThemes,
  activeThemeId,
  defaultTheme,
}) => {
  const [allThemes, setAllThemes] = useState<Theme[]>(initialThemes);
  const [activeId, setActiveId] = useState(activeThemeId);
  const initialTheme = initialThemes.find((t) => t.id === activeThemeId) ?? defaultTheme;
  const [currentThemeId, setCurrentThemeId] = useState(initialTheme.id);
  const [draft, setDraft] = useState<Theme>(() => clone(initialTheme));
  const [saved, setSaved] = useState<Theme>(() => clone(initialTheme));
  const [tab, setTab] = useState<TabKey>("brand");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [previewDark, setPreviewDark] = useState(false);
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set());
  const importInputRef = useRef<HTMLInputElement>(null);

  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const hexIssues = useMemo(() => collectHexIssues(draft), [draft]);
  const anyUploading = uploadingKeys.size > 0;

  const setUploading = useCallback((key: string, uploading: boolean) => {
    setUploadingKeys((prev) => {
      const alreadySet = prev.has(key);
      if (alreadySet === uploading) return prev;
      const next = new Set(prev);
      if (uploading) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const applyTheme = (theme: Theme) => {
    setCurrentThemeId(theme.id);
    setDraft(clone(theme));
    setSaved(clone(theme));
  };

  const handleThemeSelect = (id: string) => {
    if (id === currentThemeId) return;
    if (isDirty && !confirm("Discard unsaved changes and switch themes?")) return;
    const theme = allThemes.find((t) => t.id === id) ?? (id === defaultTheme.id ? defaultTheme : null);
    if (theme) applyTheme(theme);
  };

  const patchTop = (patch: Partial<Pick<Theme, "name" | "siteName" | "companyName" | "shortDescription">>) =>
    setDraft((prev) => ({ ...prev, ...patch }));
  const patchLogos = (patch: Partial<ThemeLogos>) =>
    setDraft((prev) => ({ ...prev, logos: { ...prev.logos, ...patch } }));
  const patchColors = (patch: Partial<ThemeColors>) =>
    setDraft((prev) => ({ ...prev, colors: { ...prev.colors, ...patch } }));
  const patchDarkColors = (patch: Partial<ThemeDarkColors>) =>
    setDraft((prev) => ({ ...prev, darkColors: { ...prev.darkColors, ...patch } }));
  const patchTypography = (patch: Partial<ThemeTypography>) =>
    setDraft((prev) => ({ ...prev, typography: { ...prev.typography, ...patch } }));
  const patchButtons = (patch: Partial<ThemeButtons>) =>
    setDraft((prev) => ({ ...prev, buttons: { ...prev.buttons, ...patch } }));
  const patchCards = (patch: Partial<ThemeCards>) =>
    setDraft((prev) => ({ ...prev, cards: { ...prev.cards, ...patch } }));
  const patchProductCard = (patch: Partial<ThemeProductCard>) =>
    setDraft((prev) => ({ ...prev, productCard: { ...prev.productCard, ...patch } }));
  const patchHeader = (patch: Partial<ThemeHeader>) =>
    setDraft((prev) => ({ ...prev, header: { ...prev.header, ...patch } }));
  const patchTopBar = (patch: Partial<NonNullable<ThemeHeader["topBar"]>>) =>
    setDraft((prev) => ({ ...prev, header: { ...prev.header, topBar: { ...prev.header.topBar, ...patch } } }));
  const patchFooter = (patch: Partial<ThemeFooter>) =>
    setDraft((prev) => ({ ...prev, footer: { ...prev.footer, ...patch } }));
  const patchBanner = (patch: Partial<ThemeBanner>) =>
    setDraft((prev) => ({ ...prev, banner: { ...prev.banner, ...patch } }));
  const patchLayout = (patch: Partial<ThemeLayout>) =>
    setDraft((prev) => ({ ...prev, layout: { ...prev.layout, ...patch } }));
  const patchDarkMode = (patch: Partial<ThemeDarkMode>) =>
    setDraft((prev) => ({ ...prev, darkMode: { ...prev.darkMode, ...patch } }));

  const persistDraft = async (): Promise<string> => {
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = draft;
    if (currentThemeId === defaultTheme.id) {
      const newId = await createTheme(input);
      const savedTheme: Theme = { ...input, id: newId, isActive: false };
      setCurrentThemeId(newId);
      setDraft(savedTheme);
      setSaved(clone(savedTheme));
      setAllThemes((prev) => [...prev, savedTheme]);
      return newId;
    }
    await updateTheme(currentThemeId, input);
    const savedTheme = clone(draft);
    setSaved(savedTheme);
    setAllThemes((prev) => prev.map((t) => (t.id === currentThemeId ? savedTheme : t)));
    return currentThemeId;
  };

  const handleSave = async () => {
    if (!isDirty) return;
    if (hexIssues.length) {
      toast.error("Fix invalid hex colors before saving.");
      return;
    }
    setSaving(true);
    try {
      await persistDraft();
      toast.success("Theme saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => setDraft(clone(saved));

  const handlePublish = async () => {
    if (hexIssues.length) {
      toast.error("Fix invalid hex colors before publishing.");
      return;
    }
    setPublishing(true);
    try {
      const idToActivate = isDirty || currentThemeId === defaultTheme.id ? await persistDraft() : currentThemeId;
      await setActiveTheme(idToActivate);
      setActiveId(idToActivate);
      setAllThemes((prev) => prev.map((t) => ({ ...t, isActive: t.id === idToActivate })));
      toast.success("Theme published — now live on the storefront");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish theme");
    } finally {
      setPublishing(false);
    }
  };

  const handleSetActive = async (id: string) => {
    setBusyId(id);
    try {
      await setActiveTheme(id);
      setActiveId(id);
      setAllThemes((prev) => prev.map((t) => ({ ...t, isActive: t.id === id })));
      toast.success("Theme published — now live on the storefront");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set active theme");
    } finally {
      setBusyId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    const source = allThemes.find((t) => t.id === id) ?? (id === defaultTheme.id ? defaultTheme : null);
    if (!source) return;
    setBusyId(id);
    try {
      const newId = await duplicateTheme(id);
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = source;
      const newTheme: Theme = { ...rest, id: newId, name: `${source.name} (copy)`, isActive: false };
      setAllThemes((prev) => [...prev, newTheme]);
      applyTheme(newTheme);
      toast.success("Theme duplicated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to duplicate theme");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this theme? This cannot be undone.")) return;
    setBusyId(id);
    try {
      await deleteTheme(id);
      setAllThemes((prev) => prev.filter((t) => t.id !== id));
      if (id === currentThemeId) {
        const fallback =
          allThemes.find((t) => t.id === activeId && t.id !== id) ?? allThemes.find((t) => t.id !== id) ?? defaultTheme;
        applyTheme(fallback);
      }
      toast.success("Theme deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete theme");
    } finally {
      setBusyId(null);
    }
  };

  const handleExport = (theme: Theme) => {
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${theme.name.trim().toLowerCase().replace(/\s+/g, "-") || "theme"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleCreateNew = async () => {
    setCreating(true);
    try {
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = defaultTheme;
      const input: ThemeInput = { ...rest, name: "New Theme", isActive: false };
      const newId = await createTheme(input);
      const newTheme: Theme = { ...input, id: newId };
      setAllThemes((prev) => [...prev, newTheme]);
      applyTheme(newTheme);
      toast.success("Theme created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create theme");
    } finally {
      setCreating(false);
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<Theme>;
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = parsed;
      const input = { ...rest, name: parsed.name || "Imported Theme", isActive: false } as ThemeInput;
      const newId = await createTheme(input);
      const newTheme: Theme = { ...input, id: newId };
      setAllThemes((prev) => [...prev, newTheme]);
      applyTheme(newTheme);
      toast.success("Theme imported");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid theme file");
    }
  };

  const scopedPreviewCss = useMemo(() => {
    try {
      return themeToCssText(draft)
        .replace(":root {", ".theme-live-preview {")
        .replace(".dark {", ".theme-live-preview.dark {");
    } catch {
      return "";
    }
  }, [draft]);

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <select
            value={currentThemeId}
            onChange={(e) => handleThemeSelect(e.target.value)}
            className={`${inputClass} w-auto min-w-[200px]`}
          >
            {allThemes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.id === activeId ? " (Active)" : ""}
              </option>
            ))}
          </select>
          {currentThemeId === activeId && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
              Live theme
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handlePublish}
          disabled={publishing || anyUploading}
          className="px-5 py-2 text-sm rounded-full bg-primary-6000 text-white font-semibold shadow disabled:opacity-50"
        >
          {publishing ? "Publishing…" : currentThemeId === activeId ? "Republish changes" : "Publish this theme"}
        </button>
      </div>

      {hexIssues.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          Fix {hexIssues.length} invalid hex color{hexIssues.length > 1 ? "s" : ""} before saving or publishing.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <div className="min-w-0">
          <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800 mb-6">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  tab === t.key
                    ? "border-primary-6000 text-primary-6000"
                    : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "brand" && (
            <BrandTab theme={draft} onFieldChange={patchTop} onLogosChange={patchLogos} onUploadingChange={setUploading} />
          )}
          {tab === "colors" && <ColorsTab colors={draft.colors} onChange={patchColors} />}
          {tab === "typography" && <TypographyTab typography={draft.typography} onChange={patchTypography} />}
          {tab === "header" && (
            <HeaderTab header={draft.header} onChange={patchHeader} onTopBarChange={patchTopBar} />
          )}
          {tab === "footer" && <FooterTab footer={draft.footer} onChange={patchFooter} />}
          {tab === "buttons" && (
            <ButtonsCardsTab
              buttons={draft.buttons}
              cards={draft.cards}
              onButtonsChange={patchButtons}
              onCardsChange={patchCards}
            />
          )}
          {tab === "productCard" && <ProductCardTab productCard={draft.productCard} onChange={patchProductCard} />}
          {tab === "banners" && <BannersTab banner={draft.banner} onChange={patchBanner} />}
          {tab === "layout" && <LayoutTab layout={draft.layout} onChange={patchLayout} />}
          {tab === "darkMode" && (
            <DarkModeTab
              darkMode={draft.darkMode}
              darkColors={draft.darkColors}
              onModeChange={patchDarkMode}
              onColorsChange={patchDarkColors}
            />
          )}
          {tab === "presets" && (
            <PresetsTab
              themes={allThemes}
              activeId={activeId}
              currentThemeId={currentThemeId}
              busyId={busyId}
              creating={creating}
              onSetActive={handleSetActive}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onExport={handleExport}
              onSelect={handleThemeSelect}
              onCreateNew={handleCreateNew}
              onImportClick={() => importInputRef.current?.click()}
            />
          )}

          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
        </div>

        <div className="lg:sticky lg:top-6">
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <h3 className={sectionTitleClass}>Live preview</h3>
              {draft.darkMode.enabled && (
                <label className="flex items-center gap-1.5 text-xs">
                  <input type="checkbox" checked={previewDark} onChange={(e) => setPreviewDark(e.target.checked)} />
                  Dark
                </label>
              )}
            </div>
            <style>{scopedPreviewCss}</style>
            <div
              className={`theme-live-preview rounded-2xl overflow-hidden border border-[var(--border)] ${
                previewDark ? "dark" : ""
              }`}
            >
              <div className="flex items-center justify-between px-4 py-3 bg-[var(--header-bg)] border-b border-[var(--border)]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-[var(--btn-bg)] flex-shrink-0" />
                  <span className="font-semibold text-sm truncate text-[var(--heading)]">
                    {draft.siteName || draft.name || "Your Store"}
                  </span>
                </div>
                <nav className="hidden sm:flex gap-2 text-[11px] text-[var(--text)] flex-shrink-0">
                  <span>Shop</span>
                  <span>Collections</span>
                  <span>About</span>
                </nav>
              </div>

              <div className="p-4 space-y-4 bg-[var(--background)]">
                <button
                  type="button"
                  className="text-[var(--btn-text)] bg-[var(--btn-bg)] text-xs transition-colors"
                  style={{
                    borderRadius: "var(--btn-radius)",
                    boxShadow: "var(--btn-shadow)",
                    paddingLeft: "var(--btn-padding-x)",
                    paddingRight: "var(--btn-padding-x)",
                    paddingTop: "var(--btn-padding-y)",
                    paddingBottom: "var(--btn-padding-y)",
                    border: "var(--btn-border)",
                    transitionDuration: "var(--btn-transition)",
                    fontWeight: "var(--button-weight)" as unknown as number,
                  }}
                >
                  Shop now
                </button>

                <div
                  className="w-40 border border-[var(--border)] overflow-hidden bg-[var(--card)]"
                  style={{ borderRadius: "var(--product-card-radius)" }}
                >
                  <div
                    className="relative h-28 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] text-neutral-400"
                    style={{ borderRadius: "var(--product-image-radius)" }}
                  >
                    Image
                    <span
                      className="absolute top-1 left-1 text-[9px] px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: "var(--badge-sale)" }}
                    >
                      Sale
                    </span>
                  </div>
                  <div className="p-2 text-xs text-[var(--text)]">
                    <p className="font-medium truncate">Product name</p>
                    <p className="text-[var(--muted)]">$49.00</p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 text-[10px] text-center bg-[var(--footer-bg)] text-[var(--muted)] border-t border-[var(--border)]">
                {draft.footer?.copyrightText || `© ${new Date().getFullYear()} ${draft.siteName || draft.name}`}
              </div>
            </div>
            <p className="text-xs text-neutral-400">
              Reflects unsaved changes instantly. Fully isolated from the live storefront.
            </p>
          </div>
        </div>
      </div>

      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-30 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur px-6 py-3 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">● Unsaved changes</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-full border border-neutral-300 dark:border-neutral-700 disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || saving || anyUploading || hexIssues.length > 0}
              className="px-5 py-2 text-sm rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeEditor;
