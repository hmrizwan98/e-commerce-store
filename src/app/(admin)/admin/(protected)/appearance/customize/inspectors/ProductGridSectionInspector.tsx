"use client";

import React, { useState } from "react";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";
import type { HomepageSection, HomepageSectionConfig } from "@/types/homepage-section";
import type { PickerOption } from "@/app/(admin)/admin/(protected)/homepage/HomepageSections";
import { MagnifyingGlassIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export interface ProductGridSectionInspectorProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
  section?: HomepageSection;
  onChangeSection?: (patch: Partial<HomepageSection>) => void;
  productOptions?: PickerOption[];
  categoryOptions?: PickerOption[];
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function ProductGridSectionInspector({
  draft,
  onChange,
  section,
  onChangeSection,
  productOptions = [],
  categoryOptions = [],
}: ProductGridSectionInspectorProps) {
  const card = draft.productCard ?? {};
  const [productSearch, setProductSearch] = useState("");

  const updateCard = (patch: Partial<NonNullable<SystemThemeConfig["productCard"]>>) => {
    onChange({ productCard: { ...card, ...patch } });
  };

  const config = section?.config ?? {};
  const mode = config.mode ?? "auto";
  const selectedProductIds = config.productIds ?? [];
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

  const toggleProductId = (id: string) => {
    const exists = selectedProductIds.includes(id);
    const nextIds = exists
      ? selectedProductIds.filter((item) => item !== id)
      : [...selectedProductIds, id];
    updateConfig({ productIds: nextIds, mode: "manual" });
  };

  const filteredProducts = productOptions.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* SECTION CONTENT & SELECTION (Per Section) */}
      {section && onChangeSection && (
        <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-800/40 space-y-4">
          <div className="flex items-center justify-between border-b border-sky-200/60 dark:border-sky-800/40 pb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Section Content & Products
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Choose which products appear in &quot;{section.title}&quot;
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
              placeholder="e.g. On Sale / Special Offers"
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

          {/* Mode Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Product Source / Filter Mode
            </label>
            <div className="grid grid-cols-1 gap-2">
              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  mode === "auto" && !selectedCategoryIds.length
                    ? "bg-white dark:bg-slate-900 border-sky-500 shadow-xs text-sky-700 dark:text-sky-300"
                    : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="productMode"
                  checked={mode === "auto" && !selectedCategoryIds.length}
                  onChange={() => updateConfig({ mode: "auto", categoryIds: [] })}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <span className="font-bold">Automatic (Default System Query)</span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    Shows all items tagged for {section.type} automatically.
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
                  name="productMode"
                  checked={mode === "manual"}
                  onChange={() => updateConfig({ mode: "manual" })}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <span className="font-bold">Manual Product Picker (Select Specific Items)</span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    Pick &amp; unpick exact products to include/exclude.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  selectedCategoryIds.length > 0
                    ? "bg-white dark:bg-slate-900 border-sky-500 shadow-xs text-sky-700 dark:text-sky-300"
                    : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="productMode"
                  checked={selectedCategoryIds.length > 0}
                  onChange={() =>
                    updateConfig({
                      mode: "auto",
                      categoryIds: categoryOptions[0] ? [categoryOptions[0].id] : [],
                    })
                  }
                  className="text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <span className="font-bold">Filter By Category / Collection</span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    Filter section products by a specific store category.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Category Filter Dropdown */}
          {selectedCategoryIds.length > 0 && (
            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Category
              </label>
              <select
                className={inputClass}
                value={selectedCategoryIds[0] ?? ""}
                onChange={(e) => updateConfig({ categoryIds: [e.target.value], mode: "auto" })}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Manual Products Picker */}
          {mode === "manual" && (
            <div className="space-y-2 pt-1 border-t border-sky-200/60 dark:border-sky-800/40">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                  Selected Products ({selectedProductIds.length})
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                    onClick={() => updateConfig({ productIds: productOptions.map((p) => p.id) })}
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                    onClick={() => updateConfig({ productIds: [] })}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Product Search Input */}
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  className={`${inputClass} pl-9`}
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>

              {/* Scrollable Checkbox Product List */}
              <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 text-center">No products found</p>
                ) : (
                  filteredProducts.map((prod) => {
                    const isChecked = selectedProductIds.includes(prod.id);
                    return (
                      <label
                        key={prod.id}
                        className={`flex items-center justify-between py-2 px-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? "bg-sky-50/80 dark:bg-sky-950/40" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleProductId(prod.id)}
                            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                          />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {prod.name}
                          </span>
                        </div>
                        {isChecked && <CheckCircleIcon className="w-4 h-4 text-sky-600 flex-shrink-0" />}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Product Limit Slider */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Max Products Limit ({config.limit ?? 8})
              </label>
            </div>
            <input
              type="range"
              min={2}
              max={24}
              step={1}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
              value={config.limit ?? 8}
              onChange={(e) => updateConfig({ limit: Number(e.target.value) })}
            />
          </div>
        </div>
      )}

      {/* GLOBAL CARD PRESENTATION STYLE */}
      <div className="space-y-4 pt-1">
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Card Presentation &amp; Design
        </h4>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Card Presentation Style
          </label>
          <select
            className={inputClass}
            value={card.variant ?? "minimal"}
            onChange={(e) => updateCard({ variant: e.target.value as any })}
          >
            <option value="sleek-pill">Sleek Pill Card (New Variant - Soft Container &amp; Swatches)</option>
            <option value="trend-glass">Trend Glass Card (2026 Modern Gradient &amp; Frosted Quick Bar)</option>
            <option value="deal-card">Deal Card (Modern Pill &amp; Buy Now - Screenshot 3 Style)</option>
            <option value="minimal">Minimal Card (Clean &amp; Rounded)</option>
            <option value="bold-grid">Bold Grid Card (Dense &amp; Vibrant)</option>
            <option value="editorial">Editorial Card (Classic &amp; Magazine-Style)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Image Aspect Ratio
          </label>
          <select
            className={inputClass}
            value={card.aspectRatio ?? "1:1"}
            onChange={(e) => updateCard({ aspectRatio: e.target.value as "1:1" | "3:4" | "4:5" | "4:3" })}
          >
            <option value="1:1">1:1 Square (Compact)</option>
            <option value="4:3">4:3 Landscape (Wide)</option>
            <option value="3:4">3:4 Portrait (Fashion)</option>
            <option value="4:5">4:5 Tall Portrait</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Badge Position
          </label>
          <select
            className={inputClass}
            value={card.badgePosition ?? "top-left"}
            onChange={(e) => updateCard({ badgePosition: e.target.value as "top-left" | "top-right" })}
          >
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
          </select>
        </div>

        <div className="space-y-2 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={card.showQuickAdd ?? true}
              onChange={(e) => updateCard({ showQuickAdd: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Enable Quick Add to Cart
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={card.showSecondaryImageOnHover ?? true}
              onChange={(e) => updateCard({ showSecondaryImageOnHover: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Show Secondary Image on Hover
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={card.showWishlist ?? true}
              onChange={(e) => updateCard({ showWishlist: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Show Wishlist Heart Button
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={card.showQuickView ?? true}
              onChange={(e) => updateCard({ showQuickView: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Show Quick View Modal Button
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
