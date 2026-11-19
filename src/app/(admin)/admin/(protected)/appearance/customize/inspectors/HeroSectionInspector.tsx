"use client";

import NativeSelect from "@/components/ui/NativeSelect";
import React, { useEffect, useState } from "react";
import {
  PlusIcon,
  PhotoIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";
import type { Banner, BannerBackgroundPosition } from "@/types/banner";
import {
  getHeroSlidesForCustomizerAction,
  saveHeroSlideForCustomizerAction,
  deleteHeroSlideForCustomizerAction,
  reorderHeroSlidesForCustomizerAction,
  toggleHeroSlideActiveForCustomizerAction,
} from "../actions";

export interface HeroSectionInspectorProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";
const labelClass = "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1";

interface SlideDraft {
  id?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  imageDesktop: string;
  imageMobile: string;
  backgroundPosition: BannerBackgroundPosition;
  isActive: boolean;
  order: number;
}

export default function HeroSectionInspector({ draft, onChange }: HeroSectionInspectorProps) {
  const banner = draft.banner ?? {
    heightPx: 450,
    mobileHeightPx: 360,
    textAlign: "center",
    overlayEnabled: true,
    overlayOpacity: 0.3,
  };

  const updateBanner = (patch: Partial<NonNullable<SystemThemeConfig["banner"]>>) => {
    onChange({ banner: { ...banner, ...patch } });
  };

  // Slides management state
  const [slides, setSlides] = useState<Banner[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [editingSlide, setEditingSlide] = useState<SlideDraft | null>(null);
  const [savingSlide, setSavingSlide] = useState(false);

  const loadSlides = async () => {
    try {
      setLoadingSlides(true);
      const res = await getHeroSlidesForCustomizerAction();
      setSlides(res);
    } catch (err) {
      console.error("Failed to fetch hero slides:", err);
    } finally {
      setLoadingSlides(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleStartAdd = () => {
    setEditingSlide({
      title: "",
      subtitle: "",
      ctaText: "Shop Now",
      ctaHref: "/collection",
      imageDesktop: "",
      imageMobile: "",
      backgroundPosition: (banner.imagePosition as BannerBackgroundPosition) || "center",
      isActive: true,
      order: slides.length,
    });
  };

  const handleStartEdit = (s: Banner) => {
    setEditingSlide({
      id: s.id,
      title: s.title || "",
      subtitle: s.subtitle || s.description || "",
      ctaText: s.ctaText || "Shop Now",
      ctaHref: s.ctaHref || "/collection",
      imageDesktop: s.imageDesktop || (s as any).image || "",
      imageMobile: s.imageMobile || "",
      backgroundPosition: s.backgroundPosition || (banner.imagePosition as BannerBackgroundPosition) || "center",
      isActive: s.isActive !== false,
      order: s.order ?? 0,
    });
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    if (!editingSlide.imageDesktop?.trim()) {
      toast.error("Desktop image is required");
      return;
    }

    try {
      setSavingSlide(true);
      await saveHeroSlideForCustomizerAction(editingSlide.id || null, {
        title: editingSlide.title.trim() || "Hero Slide",
        subtitle: editingSlide.subtitle.trim(),
        ctaText: editingSlide.ctaText.trim(),
        ctaHref: editingSlide.ctaHref.trim(),
        imageDesktop: editingSlide.imageDesktop.trim(),
        imageMobile: editingSlide.imageMobile.trim(),
        backgroundPosition: editingSlide.backgroundPosition,
        isActive: editingSlide.isActive,
        order: editingSlide.order,
      });
      toast.success(editingSlide.id ? "Slide updated" : "Slide added");
      setEditingSlide(null);
      await loadSlides();
    } catch (err: any) {
      toast.error(err.message || "Failed to save slide");
    } finally {
      setSavingSlide(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this slide?")) return;
    try {
      await deleteHeroSlideForCustomizerAction(id);
      toast.success("Slide deleted");
      await loadSlides();
    } catch (err: any) {
      toast.error("Failed to delete slide");
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await toggleHeroSlideActiveForCustomizerAction(id, !current);
      setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !current } : s)));
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  const handleMoveSlide = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const reordered = [...slides];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    setSlides(reordered);
    try {
      await reorderHeroSlidesForCustomizerAction(reordered.map((s) => s.id));
    } catch (err) {
      toast.error("Failed to save reorder");
      await loadSlides();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Hero Slider Inspector
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage hero slides, upload responsive images, configure image fitting, height, and alignment.
        </p>
      </div>

      {/* --- Section 1: Hero Slides Direct Management --- */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
            <PhotoIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Hero Slides ({slides.length})</span>
          </div>
          {!editingSlide && (
            <button
              type="button"
              onClick={handleStartAdd}
              className="py-1 px-2.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-xs transition-colors"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Add Slide
            </button>
          )}
        </div>

        {/* Slide List */}
        {!editingSlide ? (
          <div className="space-y-2">
            {loadingSlides ? (
              <p className="text-xs text-slate-400 py-3 text-center">Loading slides…</p>
            ) : slides.length === 0 ? (
              <div className="text-center py-5 space-y-2">
                <p className="text-xs text-slate-500">No hero slides uploaded yet.</p>
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  + Add your first slide
                </button>
              </div>
            ) : (
              slides.map((s, idx) => {
                const img = s.imageDesktop || (s as any).image;
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 shadow-xs"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                          No img
                        </div>
                      )}
                      {s.imageMobile && (
                        <span
                          className="absolute bottom-0 right-0 bg-sky-600 text-white text-[8px] font-bold px-1 rounded-tl"
                          title="Mobile image configured"
                        >
                          M
                        </span>
                      )}
                    </div>

                    {/* Title & Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {s.title || "Untitled Slide"}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className={s.isActive !== false ? "text-emerald-600 font-medium" : "text-slate-400"}>
                          {s.isActive !== false ? "Active" : "Disabled"}
                        </span>
                        {s.backgroundPosition && (
                          <span>· Pos: {s.backgroundPosition}</span>
                        )}
                      </div>
                    </div>

                    {/* Reorder & Action buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSlide(idx, "up")}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Move Up"
                      >
                        <ChevronUpIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === slides.length - 1}
                        onClick={() => handleMoveSlide(idx, "down")}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Move Down"
                      >
                        <ChevronDownIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(s)}
                        className="p-1 rounded text-slate-500 hover:text-indigo-600"
                        title="Edit Slide"
                      >
                        <PencilSquareIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(s.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600"
                        title="Delete Slide"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            <div className="pt-2 flex justify-between items-center text-[11px] text-indigo-700 dark:text-indigo-300">
              <a
                href="/admin/hero-slides"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:underline font-medium"
              >
                Open full Hero Slides manager
                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          /* Inline Slide Form */
          <form onSubmit={handleSaveSlide} className="space-y-3.5 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {editingSlide.id ? "Edit Hero Slide" : "New Hero Slide"}
              </span>
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop Image */}
            <div>
              <ImageUploader
                value={editingSlide.imageDesktop ? [editingSlide.imageDesktop] : []}
                onChange={(urls) => setEditingSlide({ ...editingSlide, imageDesktop: urls[0] || "" })}
                imageType="bannerHero"
                multiple={false}
                label="Desktop Image (required)"
              />
            </div>

            {/* Mobile Image */}
            <div>
              <ImageUploader
                value={editingSlide.imageMobile ? [editingSlide.imageMobile] : []}
                onChange={(urls) => setEditingSlide({ ...editingSlide, imageMobile: urls[0] || "" })}
                imageType="bannerHero"
                multiple={false}
                label="Mobile Image (optional - fallback to desktop)"
              />
            </div>

            {/* Focal Position */}
            <div>
              <label className={labelClass}>Image Focal Position</label>
              <NativeSelect size="sm"
                className={inputClass}
                value={editingSlide.backgroundPosition}
                onChange={(e) =>
                  setEditingSlide({
                    ...editingSlide,
                    backgroundPosition: e.target.value as BannerBackgroundPosition,
                  })
                }
              >
                <option value="center">Center (default)</option>
                <option value="top">Top (focus on upper portion)</option>
                <option value="bottom">Bottom (focus on lower portion)</option>
                <option value="left">Left (focus on left subject/text)</option>
                <option value="right">Right (focus on right subject)</option>
              </NativeSelect>
            </div>

            {/* Text Copy & Link */}
            <div>
              <label className={labelClass}>Slide Title / Main Heading</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Summer Essentials 2026"
                value={editingSlide.title}
                onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Sub-heading / Description</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Discover handcrafted luxury pieces"
                value={editingSlide.subtitle}
                onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Button Text</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Shop Now"
                  value={editingSlide.ctaText}
                  onChange={(e) => setEditingSlide({ ...editingSlide, ctaText: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Button Link</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="/collection"
                  value={editingSlide.ctaHref}
                  onChange={(e) => setEditingSlide({ ...editingSlide, ctaHref: e.target.value })}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={editingSlide.isActive}
                onChange={(e) => setEditingSlide({ ...editingSlide, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Active on Storefront
              </span>
            </label>

            {/* Save & Cancel */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="py-1.5 px-3 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingSlide}
                className="py-1.5 px-3 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-xs disabled:opacity-50"
              >
                <CheckIcon className="w-3.5 h-3.5" />
                {savingSlide ? "Saving…" : "Save Slide"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* --- Section 2: Banner Presentation & Fitting Settings --- */}
      <div className="space-y-4 pt-1">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Slider Presentation &amp; Layout
        </h4>

        <div>
          <label className={labelClass}>Hero Style</label>
          <NativeSelect size="sm"
            className={inputClass}
            value={draft.hero?.variant ?? "generic"}
            onChange={(e) => onChange({ hero: { ...draft.hero, variant: e.target.value as any } })}
          >
            <option value="image-only">🖼️ Full-Width Image Only (Pure Banners, No Text)</option>
            <option value="generic">Generic (default slider with text overlay)</option>
            <option value="luxe">Luxe (editorial, serif copy)</option>
            <option value="minimal">Minimal (clean, lifestyle banner)</option>
            <option value="bold-street">Bold Street (dark, high-contrast)</option>
            <option value="tech">Tech (category sidebar + deal card)</option>
          </NativeSelect>
        </div>

        <div>
          <label className={labelClass}>Image Display &amp; Fitting Mode</label>
          <NativeSelect size="sm"
            className={inputClass}
            value={banner.imageFit ?? "full"}
            onChange={(e) => updateBanner({ imageFit: e.target.value as any })}
          >
            <option value="full">Show the whole image (no cropping) - Contain</option>
            <option value="cover">Fill a fixed height (cropping allowed) - Cover</option>
            <option value="fill">Fill entire area (stretch to fit) - Fill</option>
            <option value="auto">Natural aspect ratio (Auto height, no crop &amp; no sidebars) - Auto</option>
          </NativeSelect>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <strong>Contain:</strong> Keeps 100% of the image visible without stretching or cropping.
            <br />
            <strong>Cover:</strong> Fills the entire slider container; uses focal position to avoid cutting key subjects.
            <br />
            <strong>Auto:</strong> Container dynamically scales to match image natural aspect ratio (zero crop &amp; zero sidebars).
          </p>
        </div>

        <div>
          <label className={labelClass}>Default Image Focal Position</label>
          <NativeSelect size="sm"
            className={inputClass}
            value={banner.imagePosition ?? "center"}
            onChange={(e) => updateBanner({ imagePosition: e.target.value as any })}
          >
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </NativeSelect>
        </div>

        {(banner.imageFit === "full" || !banner.imageFit) && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={banner.ambientBackdrop !== false}
              onChange={(e) => updateBanner({ ambientBackdrop: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="text-xs text-slate-800 dark:text-slate-200">
              Soft ambient backdrop blur for Contain mode
            </span>
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Desktop Height (px)</label>
            <input
              type="number"
              className={inputClass}
              min={0}
              max={900}
              step={10}
              placeholder="0 (Auto)"
              value={banner.heightPx ?? 450}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : Number(e.target.value);
                updateBanner({ heightPx: isNaN(val) ? 0 : val });
              }}
            />
            <span className="text-[10px] text-slate-400">Set 0 for Auto / Natural ratio</span>
          </div>
          <div>
            <label className={labelClass}>Mobile Height (px)</label>
            <input
              type="number"
              className={inputClass}
              min={0}
              max={700}
              step={10}
              placeholder="0 (Auto)"
              value={banner.mobileHeightPx ?? 360}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : Number(e.target.value);
                updateBanner({ mobileHeightPx: isNaN(val) ? 0 : val });
              }}
            />
            <span className="text-[10px] text-slate-400">Set 0 for Auto / Adaptive</span>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={banner.rounded ?? false}
            onChange={(e) => updateBanner({ rounded: e.target.checked })}
            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
          />
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Rounded corners (inset from screen edges)
          </span>
        </label>

        <div>
          <label className={labelClass}>Text Alignment</label>
          <NativeSelect size="sm"
            className={inputClass}
            value={banner.textAlign ?? "center"}
            onChange={(e) => updateBanner({ textAlign: e.target.value as "left" | "center" | "right" })}
          >
            <option value="left">Left Aligned</option>
            <option value="center">Centered</option>
            <option value="right">Right Aligned</option>
          </NativeSelect>
        </div>

        <div>
          <label className={labelClass}>
            Overlay Opacity ({Math.round((banner.overlayOpacity ?? 0.3) * 100)}%)
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            className="w-full cursor-pointer accent-sky-600"
            value={banner.overlayOpacity ?? 0.3}
            onChange={(e) => updateBanner({ overlayOpacity: Number(e.target.value) })}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={banner.overlayEnabled ?? true}
            onChange={(e) => updateBanner({ overlayEnabled: e.target.checked })}
            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
          />
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Enable Banner Overlay Shade
          </span>
        </label>
      </div>
    </div>
  );
}
