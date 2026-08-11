"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import { saveThemeDraftAction, publishThemeAction } from "../actions";
import type { SystemThemeConfig, ThemePresetId } from "@/lib/theme/theme-types";

export interface ThemesSelectorClientProps {
  activePresetId: ThemePresetId;
  presets: SystemThemeConfig[];
}

const THEME_DESCRIPTIONS: Record<ThemePresetId, { tag: string; description: string; industry: string }> = {
  "modern-minimal": {
    tag: "Clean & Versatile",
    description: "Sleek, rounded UI with soft shadows and balanced typography.",
    industry: "Apparel, Electronics, General Retail",
  },
  "bold-commerce": {
    tag: "High-Impact & Vibrant",
    description: "Sharp borders, bold uppercase titles, dense layout, and vibrant contrast.",
    industry: "Sports, Gadgets, Flash Sales",
  },
  "premium-luxury": {
    tag: "Elegant & Editorial",
    description: "Classic serif typography, spacious margins, neutral tones, and refined accents.",
    industry: "Luxury Fashion, Jewelry, Fine Goods",
  },
};

export default function ThemesSelectorClient({ activePresetId, presets }: ThemesSelectorClientProps) {
  const [selectedId, setSelectedId] = useState<ThemePresetId>(activePresetId);
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null);

  const handleSelectPreset = async (preset: SystemThemeConfig) => {
    setLoadingPreset(preset.presetId);
    setSelectedId(preset.presetId);
    const draftRes = await saveThemeDraftAction(preset);
    if (draftRes.ok) {
      const pubRes = await publishThemeAction();
      if (pubRes.ok) {
        toast.success(`Published ${preset.name} theme live!`);
      } else {
        toast.error("Failed to publish theme.");
      }
    } else {
      toast.error("Failed to save draft theme.");
    }
    setLoadingPreset(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {presets.map((preset) => {
        const isActive = selectedId === preset.presetId;
        const meta = THEME_DESCRIPTIONS[preset.presetId] ?? {
          tag: "Custom Preset",
          description: "Configurable merchant storefront theme.",
          industry: "General Ecommerce",
        };

        return (
          <div
            key={preset.id}
            className={`border rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex flex-col justify-between transition-all ${
              isActive ? "border-sky-500 ring-2 ring-sky-500/20 shadow-md" : "border-slate-200 dark:border-slate-800"
            }`}
          >
            {/* Visual banner preview */}
            <div
              className="h-32 p-5 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${preset.colors.background} 0%, ${preset.colors.surface} 100%)`,
                borderBottom: `2px solid ${preset.colors.border}`,
              }}
            >
              <div className="flex justify-between items-start">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm"
                  style={{
                    backgroundColor: preset.colors.card,
                    color: preset.colors.heading,
                    borderColor: preset.colors.border,
                  }}
                >
                  {meta.tag}
                </span>
                {isActive && (
                  <span className="bg-sky-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    Active Theme
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {[preset.colors.primary, preset.colors.secondary, preset.colors.accent, preset.colors.heading].map(
                  (hex, idx) => (
                    <span
                      key={idx}
                      className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  )
                )}
              </div>
            </div>

            {/* Content info */}
            <div className="p-6 flex-1 space-y-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{preset.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{meta.description}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <p className="font-medium text-slate-800 dark:text-slate-200">Best for: {meta.industry}</p>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span>Header: {preset.header.variant}</span>
                  <span>Footer: {preset.footer.variant}</span>
                  <span>Card: {preset.productCard.variant}</span>
                  <span>Font: {preset.typography.headingFont}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-6 pt-0 space-y-2">
              <Link href="/admin/appearance/customize">
                <ButtonSecondary className="w-full text-xs font-semibold">Customize Theme</ButtonSecondary>
              </Link>

              {isActive ? (
                <div className="text-center py-2 text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-900">
                  Currently Published Live
                </div>
              ) : (
                <ButtonPrimary
                  className="w-full text-xs font-bold uppercase tracking-wider"
                  loading={loadingPreset === preset.presetId}
                  onClick={() => handleSelectPreset(preset)}
                >
                  Activate &amp; Publish
                </ButtonPrimary>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
