"use client";

import React, { useState } from "react";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";
import type { HomepageSection, HomepageSectionConfig } from "@/types/homepage-section";
import type { PickerOption } from "@/app/(admin)/admin/(protected)/homepage/HomepageSections";
import { MagnifyingGlassIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export interface CategoriesSectionInspectorProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
  section?: HomepageSection;
  onChangeSection?: (patch: Partial<HomepageSection>) => void;
  categoryOptions?: PickerOption[];
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function CategoriesSectionInspector({
  draft,
  onChange,
  section,
  onChangeSection,
  categoryOptions = [],
}: CategoriesSectionInspectorProps) {
  const [categorySearch, setCategorySearch] = useState("");
  const config = section?.config ?? {};
  const mode = config.mode ?? "auto";
  const selectedCategoryIds = config.categoryIds ?? [];

  const updateConfig = (patch: Partial<HomepageSectionConfig>) => {
    if (!section || !onChangeSection) return;
    onChangeSection({
      config: {
        ...config,
        ...patch,
      },
    });
  };

  const toggleCategoryId = (id: string) => {
    const exists = selectedCategoryIds.includes(id);
    const nextIds = exists
      ? selectedCategoryIds.filter((item) => item !== id)
      : [...selectedCategoryIds, id];
    updateConfig({ categoryIds: nextIds, mode: "manual" });
  };

  const filteredCategories = categoryOptions.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* SECTION TITLE & SELECTION */}
      {section && onChangeSection && (
        <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-800/40 space-y-4">
          <div className="flex items-center justify-between border-b border-sky-200/60 dark:border-sky-800/40 pb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Category Grid Content
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Choose which collections/categories appear in this section.
              </p>
            </div>
            <span className="text-[10px] font-bold bg-sky-500 text-white px-2 py-0.5 rounded-full uppercase">
              {section.type}
            </span>
          </div>

          {/* Section Heading */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Section Title (Heading)
            </label>
            <input
              type="text"
              className={inputClass}
              value={config.heading ?? section.title ?? ""}
              onChange={(e) => updateConfig({ heading: e.target.value })}
              placeholder="e.g. Shop By Category / Collections"
            />
          </div>

          {/* Section Subheading */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subheading / Description (Optional)
            </label>
            <input
              type="text"
              className={inputClass}
              value={config.subHeading ?? ""}
              onChange={(e) => updateConfig({ subHeading: e.target.value })}
              placeholder="Leave empty for no subheading"
            />
          </div>

          {/* Selection Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Collection Selection Mode
            </label>
            <div className="grid grid-cols-1 gap-2">
              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  mode === "auto"
                    ? "bg-white dark:bg-slate-900 border-sky-500 shadow-xs text-sky-700 dark:text-sky-300"
                    : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="categoryMode"
                  checked={mode === "auto"}
                  onChange={() => updateConfig({ mode: "auto" })}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <span className="font-bold">Automatic (Show All Categories)</span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    Shows all store categories up to the section limit.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  mode === "manual"
                    ? "bg-white dark:bg-slate-900 border-sky-500 shadow-xs text-sky-700 dark:text-sky-300"
                    : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="categoryMode"
                  checked={mode === "manual"}
                  onChange={() => updateConfig({ mode: "manual" })}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <span className="font-bold">Manual Collection Picker (Select Specific Items)</span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    Pick exact collections to display or hide on the storefront.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* MANUAL CATEGORY PICKER */}
          {mode === "manual" && (
            <div className="space-y-2 pt-2 border-t border-sky-200/60 dark:border-sky-800/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Selected Collections ({selectedCategoryIds.length})
                </label>
                {selectedCategoryIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => updateConfig({ categoryIds: [] })}
                    className="text-[11px] font-semibold text-rose-600 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {categoryOptions.length > 5 && (
                <div className="relative">
                  <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    placeholder="Search collections..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />
                </div>
              )}

              <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {filteredCategories.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 text-center">No collections found.</p>
                ) : (
                  filteredCategories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => toggleCategoryId(cat.id)}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? "bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-100 font-medium"
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <CheckCircleIcon className="w-4 h-4 text-sky-600 flex-shrink-0" />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Section Limit */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Max Collections to Display
              </label>
              <span className="text-xs font-bold text-sky-600">{config.limit ?? 6}</span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              step={1}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
              value={config.limit ?? 6}
              onChange={(e) => updateConfig({ limit: Number(e.target.value) })}
            />
          </div>
        </div>
      )}

      {/* CATEGORY GRID DESIGN STYLE */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Category Grid Visual Style
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Choose the visual design theme variant for category tiles.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Category Grid Style
          </label>
          <select
            className={inputClass}
            value={draft.categories?.variant ?? "generic"}
            onChange={(e) => onChange({ categories: { ...draft.categories, variant: e.target.value as any } })}
          >
            <option value="generic">Generic (default grid)</option>
            <option value="luxe">Luxe (large editorial tiles)</option>
            <option value="minimal">Minimal (clean cards)</option>
            <option value="bold-street">Bold Street (high-contrast tiles)</option>
            <option value="tech">Tech (compact spec-style tiles)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
