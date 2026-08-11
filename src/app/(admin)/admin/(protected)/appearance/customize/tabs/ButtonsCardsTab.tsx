"use client";

import React from "react";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";
import type { RadiusSize, ShadowLevel, TransitionSpeed } from "@/types/theme";

export interface TabProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

const RADIUS_OPTIONS: { value: RadiusSize; label: string }[] = [
  { value: "none", label: "Square (0px)" },
  { value: "sm", label: "Small (4px)" },
  { value: "md", label: "Medium (8px)" },
  { value: "lg", label: "Large (12px)" },
  { value: "xl", label: "Extra Large (24px)" },
  { value: "full", label: "Pill / Full" },
];

const SHADOW_OPTIONS: { value: ShadowLevel; label: string }[] = [
  { value: "none", label: "None" },
  { value: "sm", label: "Subtle (Small)" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Deep (XL)" },
];

const SPEED_OPTIONS: { value: TransitionSpeed; label: string }[] = [
  { value: "fast", label: "Fast (100ms)" },
  { value: "normal", label: "Normal (200ms)" },
  { value: "slow", label: "Slow (350ms)" },
];

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 py-2 cursor-pointer">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
      />
    </label>
  );
}

export default function ButtonsCardsTab({ draft, onChange }: TabProps) {
  const buttons = draft.buttons ?? {};
  const cards = draft.cards ?? {};

  const setButtons = (patch: Partial<typeof buttons>) => onChange({ buttons: { ...buttons, ...patch } });
  const setCards = (patch: Partial<typeof cards>) => onChange({ cards: { ...cards, ...patch } });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Buttons &amp; Cards</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure global button shapes, shadows, borders, and card styling storefront-wide.
        </p>
      </div>

      {/* Buttons section */}
      <div className="space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Button Tokens</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Button Corner Radius
            </label>
            <select
              value={buttons.radius ?? "full"}
              onChange={(e) => setButtons({ radius: e.target.value as RadiusSize })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Button Shadow
            </label>
            <select
              value={buttons.shadow ?? "xl"}
              onChange={(e) => setButtons({ shadow: e.target.value as ShadowLevel })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            >
              {SHADOW_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Height ({buttons.heightPx ?? 48}px)
            </label>
            <input
              type="range"
              min={36}
              max={64}
              step={2}
              value={buttons.heightPx ?? 48}
              onChange={(e) => setButtons({ heightPx: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Transition Speed
            </label>
            <select
              value={buttons.transitionSpeed ?? "normal"}
              onChange={(e) => setButtons({ transitionSpeed: e.target.value as TransitionSpeed })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            >
              {SPEED_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Horizontal Padding ({buttons.paddingX ?? 24}px)
            </label>
            <input
              type="range"
              min={12}
              max={48}
              step={2}
              value={buttons.paddingX ?? 24}
              onChange={(e) => setButtons({ paddingX: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Vertical Padding ({buttons.paddingY ?? 14}px)
            </label>
            <input
              type="range"
              min={6}
              max={24}
              step={2}
              value={buttons.paddingY ?? 14}
              onChange={(e) => setButtons({ paddingY: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </div>
        </div>

        <Toggle
          label="Button Border Outline"
          checked={buttons.border ?? false}
          onChange={(v) => setButtons({ border: v })}
        />
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Cards section */}
      <div className="space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Card Tokens</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Card Corner Radius
            </label>
            <select
              value={cards.radius ?? "xl"}
              onChange={(e) => setCards({ radius: e.target.value as RadiusSize })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Card Shadow
            </label>
            <select
              value={cards.shadow ?? "none"}
              onChange={(e) => setCards({ shadow: e.target.value as ShadowLevel })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            >
              {SHADOW_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Card Inner Spacing ({cards.spacingPx ?? 16}px)
            </label>
            <input
              type="range"
              min={8}
              max={36}
              step={2}
              value={cards.spacingPx ?? 16}
              onChange={(e) => setCards({ spacingPx: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </div>
        </div>

        <Toggle
          label="Card Outline Border"
          checked={cards.border ?? false}
          onChange={(v) => setCards({ border: v })}
        />
      </div>
    </div>
  );
}
