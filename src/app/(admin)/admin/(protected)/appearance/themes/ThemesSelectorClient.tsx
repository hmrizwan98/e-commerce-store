"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  PaintBrushIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { saveThemeDraftAction, publishThemeAction } from "../actions";
import type { SystemThemeConfig, ThemePresetId } from "@/lib/theme/theme-types";

export interface ThemesSelectorClientProps {
  activePresetId: ThemePresetId;
  presets: SystemThemeConfig[];
}

const PRESET_META: Record<
  string,
  { tag: string; title: string; description: string; industry: string }
> = {
  "premium-luxury": {
    tag: "Editorial & Luxe",
    title: "Premium Luxury",
    description: "High-end editorial design with serif typography, translucent header overlays, and curated product grids.",
    industry: "Fashion, Beauty & Luxury",
  },
  "modern-minimal": {
    tag: "Clean & Modern",
    title: "Modern Minimalist",
    description: "Ultra-clean design system with crisp sans-serif typography, centered header, and high-density product grid.",
    industry: "General Ecommerce & Apparel",
  },
};

function ThemePreviewFrame({ presetId }: { presetId: ThemePresetId }) {
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
    <div ref={containerRef} className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-100 dark:bg-slate-950 pointer-events-none">
      {/* Browser Chrome Header Mockup */}
      <div className="absolute top-0 inset-x-0 h-6 bg-slate-200 dark:bg-slate-800 z-10 flex items-center px-3 gap-1.5 border-b border-slate-300 dark:border-slate-700">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
      </div>

      {visible && (
        <iframe
          src={`/admin/theme-customizer-preview?page=home&presetId=${presetId}`}
          title={`${presetId} live preview`}
          tabIndex={-1}
          aria-hidden="true"
          loading="lazy"
          className="absolute top-6 left-0 border-0"
          style={{ width: "400%", height: "400%", transform: "scale(0.25)", transformOrigin: "top left" }}
        />
      )}
    </div>
  );
}

export default function ThemesSelectorClient({ activePresetId, presets }: ThemesSelectorClientProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const activePreset = presets.find((p) => p.presetId === activePresetId) ?? presets[0];

  const handleApplyPreset = async (preset: SystemThemeConfig) => {
    setLoadingAction(preset.presetId);
    try {
      const res = await saveThemeDraftAction(preset);
      if (res.ok) {
        toast.success(`Applied "${preset.name}" preset to customizer draft!`);
        router.push("/admin/appearance/customize");
      } else {
        toast.error("Failed to apply preset to draft.");
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePublishPreset = async (preset: SystemThemeConfig) => {
    setLoadingAction(`publish-${preset.presetId}`);
    try {
      const draftRes = await saveThemeDraftAction(preset);
      if (draftRes.ok) {
        const pubRes = await publishThemeAction();
        if (pubRes.ok) {
          toast.success(`Published "${preset.name}" live storefront theme!`);
          router.refresh();
        } else {
          toast.error("Failed to publish live theme.");
        }
      } else {
        toast.error("Failed to save draft.");
      }
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl pb-10">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl shadow-lg border border-indigo-800/40">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
            <SparklesIcon className="w-3.5 h-3.5" />
            Theme Catalog &amp; Storefront Appearance
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Storefront Theme Manager</h1>
          <p className="text-sm text-slate-300">
            Customize your live storefront design, edit colors &amp; typography, or switch between theme presets in real-time.
          </p>
        </div>

        <Link href="/admin/appearance/customize">
          <button
            type="button"
            className="px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <PaintBrushIcon className="w-4 h-4" />
            Launch Theme Customizer
          </button>
        </Link>
      </div>

      {/* Currently Published Live Theme Hero Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Current Live Storefront Theme
          </h2>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Published &amp; Live
          </span>
        </div>

        {activePreset && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Preview Banner */}
            <div className="lg:col-span-7 relative border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
              <ThemePreviewFrame presetId={activePreset.presetId} />
            </div>

            {/* Right Theme Details & Actions */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                    {PRESET_META[activePreset.presetId]?.tag ?? "Default Theme"}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Preset: {activePreset.presetId}</span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {activePreset.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {PRESET_META[activePreset.presetId]?.description ?? "Configurable merchant storefront theme."}
                  </p>
                </div>

                {/* Color Swatches & Tokens */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Palette &amp; Tokens</span>
                  <div className="flex items-center gap-2">
                    {[activePreset.colors.primary, activePreset.colors.secondary, activePreset.colors.accent, activePreset.colors.buttonBackground].map((c, i) => (
                      <span key={i} className="w-5 h-5 rounded-full border border-black/10 shadow-2xs" style={{ background: c }} />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">({activePreset.typography.headingFont})</span>
                  </div>
                </div>

                {/* Structural Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Header</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{activePreset.header.variant}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Footer</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{activePreset.footer.variant}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-4">
                <Link href="/admin/appearance/customize" className="block w-full">
                  <button
                    type="button"
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <PaintBrushIcon className="w-4 h-4" />
                    Customize Live Theme
                  </button>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/admin/theme-customizer-preview?page=home&presetId=${activePreset.presetId}` as any}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <button
                      type="button"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                      Preview ↗
                    </button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handlePublishPreset(activePreset)}
                    disabled={loadingAction === `publish-${activePreset.presetId}`}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {loadingAction === `publish-${activePreset.presetId}` ? (
                      <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowPathIcon className="w-3.5 h-3.5" />
                    )}
                    Reset Preset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Theme Presets Catalog Library Grid */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Theme Preset Library
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a preset to load its colors, layout, and component variants into your Theme Customizer draft.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {presets.map((p) => {
            const isLive = p.presetId === activePresetId;
            const meta = PRESET_META[p.presetId] ?? {
              tag: "Theme Preset",
              description: "Merchant storefront theme preset.",
              industry: "General Commerce",
            };

            return (
              <div
                key={p.presetId}
                className={`bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between transition-all relative ${
                  isLive
                    ? "border-emerald-500 ring-2 ring-emerald-500/30 dark:border-emerald-500"
                    : "border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                }`}
              >
                <div>
                  <div className="relative">
                    <ThemePreviewFrame presetId={p.presetId} />
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900/90 text-white shadow-xs">
                        {meta.tag}
                      </span>
                      {isLive ? (
                        <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5 uppercase tracking-wider">
                          <CheckCircleIcon className="w-3.5 h-3.5" /> Active Theme
                        </span>
                      ) : (
                        <span className="bg-slate-800/80 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider">
                          Available Preset
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{p.name}</h3>
                      {isLive && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {meta.description}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      {[p.colors.primary, p.colors.secondary, p.colors.accent].map((c, i) => (
                        <span key={i} className="w-4 h-4 rounded-full border border-black/10 shadow-2xs" style={{ background: c }} />
                      ))}
                      <span className="text-[11px] text-slate-400 font-mono">({p.typography.headingFont})</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <Link
                    href={`/admin/theme-customizer-preview?page=home&presetId=${p.presetId}` as any}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <button
                      type="button"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                      Preview ↗
                    </button>
                  </Link>

                  {isLive ? (
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      disabled={loadingAction === p.presetId}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      {loadingAction === p.presetId ? (
                        <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                      )}
                      Active (Customize)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePublishPreset(p)}
                      disabled={loadingAction === `publish-${p.presetId}`}
                      className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      {loadingAction === `publish-${p.presetId}` ? (
                        <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <PaintBrushIcon className="w-3.5 h-3.5" />
                      )}
                      Publish &amp; Activate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
