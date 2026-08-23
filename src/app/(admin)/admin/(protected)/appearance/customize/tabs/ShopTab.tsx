"use client";

import React from "react";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";

export interface TabProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

/**
 * Collection/category listing page settings. Product-by-product rendering
 * (card style, badges, quick add) lives in the Product tab and is shared
 * with every other product grid on the site - this tab only covers the
 * Shop/Collection page's own grid density.
 */
export default function ShopTab({ draft, onChange }: TabProps) {
  const layout = draft.layout ?? {};
  const collection = draft.collection ?? {};

  const setLayout = (patch: Partial<typeof layout>) => onChange({ layout: { ...layout, ...patch } });
  const setCollection = (patch: Partial<typeof collection>) => onChange({ collection: { ...collection, ...patch } });

  const gridDesktop = collection.gridColumnsDesktop ?? 4;
  const gridMobile = collection.gridColumnsMobile ?? 2;
  const showFilter = collection.showSidebarFilter ?? true;
  const filterPos = collection.filterPosition ?? "left";
  const showSort = collection.showSorting ?? true;
  const showBanner = collection.showHeroBanner ?? true;
  const perPage = collection.productsPerPage ?? 12;

  return (
    <div className="space-y-6 max-w-2xl text-slate-900 dark:text-slate-100">
      <div>
        <h2 className="text-lg font-bold">Shop &amp; Collection Page Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Customize the layout, grid columns, filters, sorting, and hero banner for all category and collection listing pages.
        </p>
      </div>

      {/* Grid Columns (Desktop & Mobile) */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Grid Layout &amp; Density</h3>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Desktop Products Per Row ({gridDesktop} columns)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 5].map((cols) => (
              <button
                key={cols}
                type="button"
                onClick={() => setCollection({ gridColumnsDesktop: cols as any })}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  gridDesktop === cols
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                }`}
              >
                {cols} Cols
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Mobile Products Per Row ({gridMobile} columns)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2].map((cols) => (
              <button
                key={cols}
                type="button"
                onClick={() => setCollection({ gridColumnsMobile: cols as any })}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  gridMobile === cols
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                }`}
              >
                {cols} {cols === 1 ? "Column (Full Width)" : "Columns (2 Grid)"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Grid Spacing ({layout.gridGapPx ?? 24}px)
          </label>
          <input
            type="range"
            min={12}
            max={48}
            step={4}
            value={layout.gridGapPx ?? 24}
            onChange={(e) => setLayout({ gridGapPx: parseInt(e.target.value, 10) })}
            className="w-full cursor-pointer accent-indigo-600"
          />
        </div>
      </div>

      {/* Collection Hero & Banner */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Header &amp; Banner Customization</h3>

        <div className="flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold">Show Collection Hero Banner</span>
            <span className="block text-[11px] text-slate-500">Displays category title, subtitle and hero background</span>
          </div>
          <button
            type="button"
            onClick={() => setCollection({ showHeroBanner: !showBanner })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              showBanner ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                showBanner ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {showBanner && (
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Banner Title
              </label>
              <input
                type="text"
                value={collection.heroTitle ?? ""}
                onChange={(e) => setCollection({ heroTitle: e.target.value })}
                placeholder="e.g. Premium Collections"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Banner Subtitle / Description
              </label>
              <input
                type="text"
                value={collection.heroSubtitle ?? ""}
                onChange={(e) => setCollection({ heroSubtitle: e.target.value })}
                placeholder="e.g. Discover exceptional products handcrafted for your everyday lifestyle."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Banner Image URL
              </label>
              <input
                type="url"
                value={collection.heroImageUrl ?? ""}
                onChange={(e) => setCollection({ heroImageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/... or paste image URL"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Banner Height
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "small", label: "Compact" },
                  { key: "medium", label: "Standard" },
                  { key: "large", label: "Tall Hero" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setCollection({ heroHeight: item.key as any })}
                    className={`py-1.5 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      (collection.heroHeight ?? "medium") === item.key
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtering & Sorting */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Filtering &amp; Sorting</h3>

        <div className="flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold">Category Filter Sidebar</span>
            <span className="block text-[11px] text-slate-500">Enable category, price, color and size filter sidebar</span>
          </div>
          <button
            type="button"
            onClick={() => setCollection({ showSidebarFilter: !showFilter })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              showFilter ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                showFilter ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {showFilter && (
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Filter Position</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCollection({ filterPosition: "left" })}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  filterPos === "left"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                }`}
              >
                Left Sidebar
              </button>
              <button
                type="button"
                onClick={() => setCollection({ filterPosition: "top" })}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  filterPos === "top"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                }`}
              >
                Top Bar (Drawer)
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
          <div>
            <span className="block text-xs font-bold">Show Sorting Dropdown</span>
            <span className="block text-[11px] text-slate-500">Allow customers to sort by price, popularity, and new arrivals</span>
          </div>
          <button
            type="button"
            onClick={() => setCollection({ showSorting: !showSort })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              showSort ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                showSort ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Additional Collection Page Sections (Bottom Sections) */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Collection Page Sections</h3>
        <p className="text-[11px] text-slate-500">Add or remove bottom promotional sections on the collection page.</p>

        <div className="space-y-3">
          {/* Promo Deals Banner Section */}
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="block text-xs font-bold">Promotional Deals Banner</span>
              <span className="block text-[11px] text-slate-500">Displays discount banner below products</span>
            </div>
            <button
              type="button"
              onClick={() => setCollection({ showBottomPromo: !(collection.showBottomPromo ?? true) })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                (collection.showBottomPromo ?? true) ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  (collection.showBottomPromo ?? true) ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Featured Collections Slider */}
          <div className="flex items-center justify-between py-1 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div>
              <span className="block text-xs font-bold">Featured Categories Carousel</span>
              <span className="block text-[11px] text-slate-500">Displays interactive category cards slider</span>
            </div>
            <button
              type="button"
              onClick={() => setCollection({ showFeaturedSection: !(collection.showFeaturedSection ?? true) })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                (collection.showFeaturedSection ?? true) ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  (collection.showFeaturedSection ?? true) ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Pagination &amp; Load Count</h3>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Products Per Page ({perPage} items)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[8, 12, 16, 24].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setCollection({ productsPerPage: count as any })}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  perPage === count
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                }`}
              >
                {count} Products
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
