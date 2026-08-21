"use client";

import React from "react";
import Link from "next/link";
import ImageUploader from "@/components/admin/ImageUploader";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";
import type { HomepageSection, HomepageSectionConfig } from "@/types/homepage-section";
import { ArrowTopRightOnSquareIcon, PhotoIcon } from "@heroicons/react/24/outline";

export interface PromoSectionInspectorProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
  section?: HomepageSection;
  onChangeSection?: (patch: Partial<HomepageSection>) => void;
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function PromoSectionInspector({
  draft,
  onChange,
  section,
  onChangeSection,
}: PromoSectionInspectorProps) {
  const config = section?.config ?? {};

  const updateConfig = (patch: Partial<HomepageSectionConfig>) => {
    if (!section || !onChangeSection) return;
    onChangeSection({
      config: {
        ...config,
        ...patch,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Promo Banner Inspector
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize content, text copy, banner image upload, layout variant, and presentation style for your promo banner.
        </p>
      </div>

      {/* SECTION CONTENT & COPY CONTROLS */}
      {section && onChangeSection && (
        <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-800/40 space-y-4">
          <div className="flex items-center justify-between border-b border-sky-200/60 dark:border-sky-800/40 pb-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Banner Copy &amp; Content
            </h4>
            <span className="text-[10px] font-bold bg-sky-500 text-white px-2 py-0.5 rounded-full uppercase">
              {section.type}
            </span>
          </div>

          {/* Badge / Tagline */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Top Badge / Tagline (Optional)
            </label>
            <input
              type="text"
              className={inputClass}
              value={config.badgeText ?? ""}
              onChange={(e) => updateConfig({ badgeText: e.target.value })}
              placeholder="e.g. STORE or EXCLUSIVE OFFER"
            />
          </div>

          {/* Banner Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Banner Heading (Title)
            </label>
            <input
              type="text"
              className={inputClass}
              value={config.heading ?? section.title ?? ""}
              onChange={(e) => updateConfig({ heading: e.target.value })}
              placeholder="e.g. New Arrivals in Jewelry"
            />
          </div>

          {/* Subheading / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subheading / Description
            </label>
            <textarea
              rows={3}
              className={inputClass}
              value={config.subHeading ?? ""}
              onChange={(e) => updateConfig({ subHeading: e.target.value })}
              placeholder="e.g. Discover our latest handcrafted collection with free shipping & savings combo..."
            />
          </div>

          {/* Primary Action Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Button Label
              </label>
              <input
                type="text"
                className={inputClass}
                value={config.buttonText ?? ""}
                onChange={(e) => updateConfig({ buttonText: e.target.value })}
                placeholder="e.g. Shop Jewelry"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Button URL
              </label>
              <input
                type="text"
                className={inputClass}
                value={config.buttonHref ?? ""}
                onChange={(e) => updateConfig({ buttonHref: e.target.value })}
                placeholder="e.g. /collection"
              />
            </div>
          </div>

          {/* Secondary Action Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Secondary Button Label
              </label>
              <input
                type="text"
                className={inputClass}
                value={config.secondaryButtonText ?? ""}
                onChange={(e) => updateConfig({ secondaryButtonText: e.target.value })}
                placeholder="e.g. Discover more"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Secondary Button URL
              </label>
              <input
                type="text"
                className={inputClass}
                value={config.secondaryButtonHref ?? ""}
                onChange={(e) => updateConfig({ secondaryButtonHref: e.target.value })}
                placeholder="e.g. /search"
              />
            </div>
          </div>

          {/* Banner Image Uploader */}
          <div className="pt-2">
            <ImageUploader
              value={config.imageUrl ? [config.imageUrl] : []}
              onChange={(urls) => updateConfig({ imageUrl: urls[0] || "" })}
              imageType="banner"
              multiple={false}
              label="Promo Banner Image"
            />
          </div>

          {/* Layout Variant Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Promo Layout Variant
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: 1, label: "Variant 1 (Split Promo)" },
                { v: 2, label: "Variant 2 (Soft Box)" },
                { v: 3, label: "Variant 3 (Perks Box)" },
              ].map(({ v, label }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => updateConfig({ variant: v as 1 | 2 | 3 })}
                  className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                    (config.variant ?? 1) === v
                      ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL THEME PRESENTATION STYLE */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Global Design &amp; Style Theme
        </h4>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Promo Banner Theme Style
          </label>
          <select
            className={inputClass}
            value={draft.promo?.styleVariant ?? "generic"}
            onChange={(e) => onChange({ promo: { ...draft.promo, styleVariant: e.target.value as any } })}
          >
            <option value="generic">Generic (default promo layout)</option>
            <option value="luxe">Luxe (editorial split-image)</option>
            <option value="minimal">Minimal (clean, single image)</option>
            <option value="bold-street">Bold Street (high-contrast flash drop)</option>
            <option value="tech">Tech (dark gradient deals card)</option>
          </select>
        </div>

        {/* Database Link Box */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <PhotoIcon className="w-4 h-4 text-sky-500" />
              Manage Banners Catalog
            </span>
            <Link
              href={"/admin/promo-banners" as any}
              target="_blank"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
            >
              Banners Manager <ArrowTopRightOnSquareIcon className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Upload banner image and edit text copy above, or manage automated promotional banners from your Banners catalog.
          </p>
        </div>
      </div>
    </div>
  );
}
