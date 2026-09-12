"use client";

import React, { useState, useEffect } from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import Radio from "@/shared/Radio/Radio";
import MySwitch from "@/components/MySwitch";
import { FILTER_COLORS, FILTER_SIZES, PRICE_RANGE, SORT_OPTIONS } from "@/lib/filters/constants";
import { useFilterParams } from "@/hooks/useFilterParams";
import type { FilterCategoryOption } from "@/components/TabFilters";

export interface SidebarFiltersProps {
  categories?: FilterCategoryOption[];
  availableColors?: string[];
  availableSizes?: string[];
  showHeader?: boolean;
}

// Every filter change commits straight to the URL
const SidebarFilters = ({
  categories = [],
  availableColors = FILTER_COLORS,
  availableSizes = FILTER_SIZES,
  showHeader = true,
}: SidebarFiltersProps) => {
  const { filters, applyFilters, clearAll } = useFilterParams();

  // Dynamic Categories from props (or fallbacks)
  const DATA_categories = categories.length > 0
    ? categories.map((c) => ({ name: c.name }))
    : [
        { name: "All Categories" },
        { name: "Clothing" },
        { name: "Accessories" },
        { name: "Footwear" },
      ];

  const DATA_colors = availableColors.map((name) => ({ name }));
  const DATA_sizes = availableSizes.map((name) => ({ name }));
  const DATA_sortOrderRadios = SORT_OPTIONS;

  const [isOnSale, setIsIsOnSale] = useState(filters.sale);
  const [rangePrices, setRangePrices] = useState<number[]>([
    filters.minPrice ?? PRICE_RANGE[0],
    filters.maxPrice ?? PRICE_RANGE[1],
  ]);
  const [categoriesState, setCategoriesState] = useState<string[]>(filters.category);
  const [colorsState, setColorsState] = useState<string[]>(filters.color);
  const [sizesState, setSizesState] = useState<string[]>(filters.size);
  const [sortOrderStates, setSortOrderStates] = useState<string>(filters.sort ?? "");

  // Sync state when filters URL prop changes or resets
  useEffect(() => {
    setCategoriesState(filters.category);
    setColorsState(filters.color);
    setSizesState(filters.size);
    setIsIsOnSale(filters.sale);
    setSortOrderStates(filters.sort ?? "");
    setRangePrices([
      filters.minPrice ?? PRICE_RANGE[0],
      filters.maxPrice ?? PRICE_RANGE[1],
    ]);
  }, [filters]);

  const hasActiveFilters =
    categoriesState.length > 0 ||
    colorsState.length > 0 ||
    sizesState.length > 0 ||
    isOnSale ||
    Boolean(sortOrderStates) ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined;

  const handleClearAll = () => {
    setCategoriesState([]);
    setColorsState([]);
    setSizesState([]);
    setIsIsOnSale(false);
    setSortOrderStates("");
    setRangePrices([PRICE_RANGE[0], PRICE_RANGE[1]]);
    clearAll();
  };

  const handleChangeCategories = (checked: boolean, name: string) => {
    const next = checked
      ? [...categoriesState, name]
      : categoriesState.filter((i) => i !== name);
    setCategoriesState(next);
    applyFilters({ category: next });
  };

  const handleChangeColors = (checked: boolean, name: string) => {
    const next = checked ? [...colorsState, name] : colorsState.filter((i) => i !== name);
    setColorsState(next);
    applyFilters({ color: next });
  };

  const handleChangeSizes = (checked: boolean, name: string) => {
    const next = checked ? [...sizesState, name] : sizesState.filter((i) => i !== name);
    setSizesState(next);
    applyFilters({ size: next });
  };

  const handleChangeSortOrder = (id: string) => {
    setSortOrderStates(id);
    applyFilters({ sort: id || undefined });
  };

  const handleChangeOnSale = (enabled: boolean) => {
    setIsIsOnSale(enabled);
    applyFilters({ sale: enabled });
  };

  const handleChangePriceRange = (range: number[]) => {
    setRangePrices(range);
  };

  const commitPriceRange = () => {
    applyFilters({
      minPrice: rangePrices[0] === PRICE_RANGE[0] ? undefined : rangePrices[0],
      maxPrice: rangePrices[1] === PRICE_RANGE[1] ? undefined : rangePrices[1],
    });
  };

  const renderTabsCategories = () => {
    return (
      <div className="relative flex flex-col py-5 space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Categories</h3>
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {DATA_categories.map((item) => (
            <Checkbox
              key={item.name}
              id={`cat-filter-${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              name={item.name}
              label={item.name}
              checked={categoriesState.includes(item.name)}
              sizeClassName="w-4 h-4 rounded"
              labelClassName="text-xs font-semibold text-slate-700 dark:text-slate-300"
              onChange={(checked) => handleChangeCategories(checked, item.name)}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderTabsColor = () => {
    return (
      <div className="relative flex flex-col py-5 space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Colors</h3>
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {DATA_colors.map((item) => (
            <Checkbox
              key={item.name}
              id={`color-filter-${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              sizeClassName="w-4 h-4 rounded"
              labelClassName="text-xs font-semibold text-slate-700 dark:text-slate-300"
              name={item.name}
              label={item.name}
              checked={colorsState.includes(item.name)}
              onChange={(checked) => handleChangeColors(checked, item.name)}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderTabsSize = () => {
    return (
      <div className="relative flex flex-col py-5 space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Sizes</h3>
        <div className="flex flex-wrap gap-2">
          {DATA_sizes.map((item) => {
            const isSelected = sizesState.includes(item.name);
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleChangeSizes(!isSelected, item.name)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTabsPriceRange = () => {
    return (
      <div className="relative flex flex-col py-5 space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Price Range</h3>
        <div className="px-1">
          <Slider
            range
            min={PRICE_RANGE[0]}
            max={PRICE_RANGE[1]}
            step={5}
            defaultValue={[rangePrices[0], rangePrices[1]]}
            allowCross={false}
            onChange={(_input: number | number[]) =>
              handleChangePriceRange(_input as number[])
            }
            onAfterChange={commitPriceRange}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Min Price
            </label>
            <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
              <span>${rangePrices[0]}</span>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Max Price
            </label>
            <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
              <span>${rangePrices[1]}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabsSortOrder = () => {
    return (
      <div className="relative flex flex-col py-5 space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Sort Order</h3>
        <div className="space-y-2">
          {DATA_sortOrderRadios.map((item) => (
            <Radio
              id={item.id}
              key={item.id}
              name="radioNameSort"
              label={item.name}
              defaultChecked={sortOrderStates === item.id}
              sizeClassName="w-4 h-4"
              onChange={handleChangeSortOrder}
              className="!text-xs font-semibold"
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="text-slate-900 dark:text-slate-100">
      {showHeader && (
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>⚡</span> Filters
          </h3>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer transition-all"
            >
              Clear All
            </button>
          )}
        </div>
      )}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {renderTabsCategories()}
        {renderTabsColor()}
        {renderTabsSize()}
        {renderTabsPriceRange()}
        <div className="py-5">
          <MySwitch
            label="On Sale Only"
            desc="Discounted items"
            enabled={isOnSale}
            onChange={handleChangeOnSale}
          />
        </div>
        {renderTabsSortOrder()}
      </div>
    </div>
  );
};

export default SidebarFilters;
