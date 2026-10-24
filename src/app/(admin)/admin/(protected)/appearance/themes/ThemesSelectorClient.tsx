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
  { tag: string; title: string; description: string; industry: string; highlights: string[] }
> = {
  "premium-luxury": {
    tag: "Editorial & Luxe",
    title: "Premium Luxury",
    description: "Elegant serif headings, a see-through header over a big hero image and spacious, curated product grids.",
    industry: "Fashion, beauty & luxury",
    highlights: ["Serif headings", "Image-led hero", "Spacious grid"],
  },
  "modern-minimal": {
    tag: "Clean & Modern",
    title: "Modern Minimal",
    description: "Crisp sans-serif type, a centred header and a compact grid that shows more products per screen.",
    industry: "General stores & apparel",
    highlights: ["Sans-serif type", "Centred header", "Dense grid"],
  },
};

const FALLBACK_META = {
  tag: "Theme",
  title: "",
  description: "A storefront theme preset.",
  industry: "Any store",
  highlights: [] as string[],
};

const metaFor = (p: SystemThemeConfig) => {
  const m = PRESET_META[p.presetId] ?? FALLBACK_META;
  return { ...m, title: m.title || p.name };
};

const humanize = (v?: string) => (v ? v.replace(/[-_]/g, " ") : "-");

/** Renders the real storefront home page (via the customizer preview route) scaled down to
 * fit its box at any width: a 1280px-wide "desktop" viewport is scaled to the container. */
function ThemePreviewFrame({ presetId, className = "h-64 sm:h-72" }: { presetId: ThemePresetId; className?: string }) {
  const [visible, setVisible] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const VIEWPORT = 1280;
  const CHROME = 28;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    const ro = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  const scale = box.w ? box.w / VIEWPORT : 0.25;
  const frameHeight = box.h ? Math.max(0, box.h - CHROME) / scale : 1200;

  return (
    <div ref={containerRef} className={`relative w-full overflow-hidden bg-slate-50 dark:bg-slate-950 pointer-events-none ${className}`}>
      {/* Browser chrome mock-up */}
      <div className="absolute top-0 inset-x-0 h-7 bg-slate-200/90 dark:bg-slate-800/90 z-20 flex items-center px-3 justify-between border-b border-slate-300/80 dark:border-slate-700/80">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/90" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" />
        </div>
        <div className="px-3 py-0.5 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-300/50 dark:border-slate-700/50 text-[10px] font-mono text-slate-500 dark:text-slate-400">
          your-store.com
        </div>
        <div className="w-10" />
      </div>

      {/* Skeleton while the live preview loads */}
      {!iframeLoaded && (
        <div className="absolute inset-0 pt-10 px-4 pb-4 flex flex-col gap-3" aria-hidden="true">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-2.5 w-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
              ))}
            </div>
          </div>
          <div className="flex-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-slate-200/70 dark:bg-slate-800/70" />
            ))}
          </div>
        </div>
      )}

      {visible && box.w > 0 && (
        <iframe
          src={`/admin/theme-customizer-preview?page=home&presetId=${presetId}`}
          title={`${presetId} live preview`}
          tabIndex={-1}
          aria-hidden="true"
          loading="lazy"
          onLoad={() => setIframeLoaded(true)}
          className={`absolute left-0 border-0 transition-opacity duration-500 ${iframeLoaded ? "opacity-100" : "opacity-0"}`}
          style={{ top: CHROME, width: VIEWPORT, height: frameHeight, transform: `scale(${scale})`, transformOrigin: "top left" }}
        />
      )}
    </div>
  );
}

function Swatches({ preset, size = "w-5 h-5" }: { preset: SystemThemeConfig; size?: string }) {
  const swatches = (
    [
      ["Primary", preset.colors.primary],
      ["Secondary", preset.colors.secondary],
      ["Accent", preset.colors.accent],
      ["Buttons", preset.colors.buttonBackground],
    ] as [string, string | undefined][]
  ).filter((s): s is [string, string] => Boolean(s[1]));
  return (
    <div className="flex items-center gap-1.5">
      {swatches.map(([label, c]) => (
        <span key={label} title={`${label}: ${c}`} className={`${size} rounded-full ring-1 ring-black/10 dark:ring-white/15 shadow-2xs`} style={{ background: c }} />
      ))}
    </div>
  );
}

export default function ThemesSelectorClient({ activePresetId, presets }: ThemesSelectorClientProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const activePreset = presets.find((p) => p.presetId === activePresetId) ?? presets[0];

  /** Same behaviour as before (save preset as draft -> publish) - now with a clear warning,
   * because it replaces the live design and any customizations made to it. */
  const handlePublishPreset = async (preset: SystemThemeConfig, mode: "switch" | "reset") => {
    const title = metaFor(preset).title;
    const message =
      mode === "reset"
        ? `Reset your live storefront to the original "${title}" design?\n\nColours, fonts and layout changes you made in the customizer will be replaced. This can't be undone.`
        : `Switch your live storefront to "${title}"?\n\nYour store will use this theme's colours, fonts and layout straight away. Customizations made to your current theme will be replaced.`;
    if (!window.confirm(message)) return;
    setLoadingAction(`publish-${preset.presetId}`);
    try {
      const draftRes = await saveThemeDraftAction(preset);
      if (draftRes?.ok) {
        const pubRes = await publishThemeAction();
        if (pubRes?.ok) {
          toast.success(mode === "reset" ? `"${title}" reset to its original design.` : `"${title}" is now live on your store.`);
          router.refresh();
        } else {
          toast.error(pubRes?.message || "Failed to publish live theme.");
        }
      } else {
        toast.error(draftRes?.message || "Failed to save draft.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to publish preset.");
    } finally {
      setLoadingAction(null);
    }
  };

  const activeMeta = activePreset ? metaFor(activePreset) : null;

  return (
    <div className="space-y-8 max-w-6xl pb-10">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl shadow-lg border border-indigo-800/40">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
            <SparklesIcon className="w-3.5 h-3.5" />
            Theme Catalog
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Storefront Themes</h1>
          <p className="text-sm text-slate-300">
            Pick the look of your online store. Switch themes in one click, or open the customizer to change colours, fonts and sections.
          </p>
        </div>

        <Link
          href="/admin/appearance/customize"
          className="px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 flex items-center gap-2 active:scale-95 transition-all"
        >
          <PaintBrushIcon className="w-4 h-4" />
          Open Theme Customizer
        </Link>
      </div>

      {/* Current live theme */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Your live theme</h2>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Live on your store
          </span>
        </div>

        {activePreset && activeMeta && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex">
              <ThemePreviewFrame presetId={activePreset.presetId} className="h-64 sm:h-80 lg:h-full lg:min-h-[22rem]" />
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                  {activeMeta.tag}
                </span>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{activeMeta.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{activeMeta.description}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Best for:</span> {activeMeta.industry}
                  </p>
                </div>

                <dl className="grid grid-cols-3 gap-2 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <dt className="text-[10px] text-slate-500 font-bold uppercase">Colours</dt>
                    <dd className="mt-1.5">
                      <Swatches preset={activePreset} size="w-4 h-4" />
                    </dd>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 min-w-0">
                    <dt className="text-[10px] text-slate-500 font-bold uppercase">Header</dt>
                    <dd className="font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">{humanize(activePreset.header.variant)}</dd>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 min-w-0">
                    <dt className="text-[10px] text-slate-500 font-bold uppercase">Font</dt>
                    <dd className="font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">{humanize(activePreset.typography.headingFont)}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-2.5">
                <Link
                  href="/admin/appearance/customize"
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <PaintBrushIcon className="w-4 h-4" />
                  Customize this theme
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/admin/theme-customizer-preview?page=home&presetId=${activePreset.presetId}` as any}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    Full preview
                  </Link>
                  <button
                    type="button"
                    onClick={() => handlePublishPreset(activePreset, "reset")}
                    disabled={loadingAction !== null}
                    title="Replace your customizations with this theme's original design"
                    className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <ArrowPathIcon className={`w-3.5 h-3.5 ${loadingAction === `publish-${activePreset.presetId}` ? "animate-spin" : ""}`} />
                    Reset to original
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Theme library */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100">All themes</h2>
          <p className="text-xs text-slate-500 mt-0.5">Preview any theme first. Activating one makes it live on your store straight away.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {presets.map((p) => {
            const isLive = p.presetId === activePresetId;
            const meta = metaFor(p);
            const busy = loadingAction === `publish-${p.presetId}`;

            return (
              <article
                key={p.presetId}
                aria-current={isLive ? "true" : undefined}
                className={`bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden shadow-xs flex flex-col transition-all ${
                  isLive ? "border-emerald-500 ring-2 ring-emerald-500/25" : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 hover:shadow-md"
                }`}
              >
                <div className="relative">
                  <ThemePreviewFrame presetId={p.presetId} className="h-56 sm:h-64" />
                  {isLive && (
                    <span className="absolute top-9 right-3 z-30 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
                      <CheckCircleIcon className="w-3.5 h-3.5" /> Live
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-3 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{meta.tag}</span>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{meta.title}</h3>
                    </div>
                    <Swatches preset={p} size="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{meta.description}</p>
                  <p className="text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Best for:</span> {meta.industry}
                  </p>
                  {meta.highlights.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5">
                      {meta.highlights.map((h) => (
                        <li key={h} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <Link
                    href={`/admin/theme-customizer-preview?page=home&presetId=${p.presetId}` as any}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    Preview
                  </Link>

                  {isLive ? (
                    // Opens the customizer on the current design (it no longer overwrites the
                    // customizer draft with the preset's defaults).
                    <Link
                      href="/admin/appearance/customize"
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                    >
                      <PaintBrushIcon className="w-3.5 h-3.5" />
                      Customize
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePublishPreset(p, "switch")}
                      disabled={loadingAction !== null}
                      className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {busy ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
                      {busy ? "Activating…" : "Activate theme"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
