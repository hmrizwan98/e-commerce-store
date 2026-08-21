"use client";

import React, { useEffect, useRef, useState } from "react";
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

const THEME_DESCRIPTIONS: Record<string, { tag: string; description: string; industry: string }> = {
  "premium-luxury": {
    tag: "Complete Storefront Template",
    description:
      "Elegant editorial layout with serif typography, refined spacing, and a bespoke component for every storefront surface - header, hero, categories, promo, product grid, product detail, cart, and announcement bar.",
    industry: "General Retail",
  },
};

/**
 * Large real visual preview - a scaled-down, non-interactive iframe onto the
 * existing /admin/theme-customizer-preview route (with ?presetId= so it
 * renders the static preset directly, touching zero Firestore docs).
 * Lazy-mounted on scroll-into-view. The 400%/scale(0.25) pairing is
 * deliberate: percentage widths on an absolutely-positioned element resolve
 * against the parent, so this fills the panel responsively without
 * measuring anything in JS.
 */
function ThemePreviewThumbnail({ presetId }: { presetId: ThemePresetId }) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative h-72 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 pointer-events-none">
      {visible && (
        <iframe
          src={`/admin/theme-customizer-preview?page=home&presetId=${presetId}`}
          title={`${presetId} live preview`}
          tabIndex={-1}
          aria-hidden="true"
          loading="lazy"
          className="absolute top-0 left-0 border-0"
          style={{ width: "400%", height: "400%", transform: "scale(0.25)", transformOrigin: "top left" }}
        />
      )}
    </div>
  );
}

export default function ThemesSelectorClient({ activePresetId, presets }: ThemesSelectorClientProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const preset = presets[0];

  if (!preset) {
    return <p className="text-sm text-slate-500">No default theme is configured.</p>;
  }

  const meta = THEME_DESCRIPTIONS[preset.presetId] ?? {
    tag: "Default Theme",
    description: "Configurable merchant storefront theme.",
    industry: "General Ecommerce",
  };
  const isActive = activePresetId === preset.presetId;

  const withLoading = async (key: string, fn: () => Promise<void>) => {
    setLoadingAction(key);
    try {
      await fn();
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetToDefault = () =>
    withLoading("reset", async () => {
      const draftRes = await saveThemeDraftAction(preset);
      if (draftRes.ok) {
        const pubRes = await publishThemeAction();
        if (pubRes.ok) {
          toast.success(`Published ${preset.name} live!`);
        } else {
          toast.error("Failed to publish theme.");
        }
      } else {
        toast.error("Failed to save draft theme.");
      }
    });

  return (
    <div className="max-w-3xl border rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <div className="relative">
        <ThemePreviewThumbnail presetId={preset.presetId} />
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-950/90 text-slate-800 dark:text-slate-100 shadow-sm">
            {meta.tag}
          </span>
          {isActive && (
            <span className="bg-sky-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              Live
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{preset.name}</h3>
          <p className="text-sm text-slate-500 mt-1">{meta.description}</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
          <p className="font-medium text-slate-800 dark:text-slate-200">Best for: {meta.industry}</p>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <span>Header: {preset.header.variant}</span>
            <span>Footer: {preset.footer.variant}</span>
            <span>Card: {preset.productCard.variant}</span>
            <span>Hero: {preset.hero?.variant ?? "generic"}</span>
            <span>Cart: {preset.cart?.variant ?? "minimal"}</span>
            <span>Font: {preset.typography.headingFont}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href={`/admin/theme-customizer-preview?page=home&presetId=${preset.presetId}` as any}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ButtonSecondary className="w-full text-xs font-semibold">Preview</ButtonSecondary>
          </Link>
          <Link href="/admin/appearance/customize">
            <ButtonSecondary className="w-full text-xs font-semibold">Customize</ButtonSecondary>
          </Link>
          <ButtonPrimary
            className="col-span-2 w-full text-xs font-bold uppercase tracking-wider"
            loading={loadingAction === "reset"}
            onClick={handleResetToDefault}
          >
            Reset to Default Theme
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
