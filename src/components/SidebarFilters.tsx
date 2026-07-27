"use client";

import React, { useState } from "react";
import Checkbox from "@/shared/Checkbox/Checkbox";
import Slider from "rc-slider";
import Radio from "@/shared/Radio/Radio";
import MySwitch from "@/components/MySwitch";
import { FILTER_COLORS, FILTER_SIZES, PRICE_RANGE, SORT_OPTIONS } from "@/lib/filters/constants";
import { useFilterParams } from "@/hooks/useFilterParams";
import type { FilterCategoryOption } from "@/components/TabFilters";

export interface SidebarFiltersProps {
  categories?: FilterCategoryOption[];
}

const DATA_colors = FILTER_COLORS.map((name) => ({ name }));
const DATA_sizes = FILTER_SIZES.map((name) => ({ name }));
const DATA_sortOrderRadios = SORT_OPTIONS;

// This sidebar has no explicit Apply step (unlike TabFilters' popovers), so
// every change commits straight to the URL.
const SidebarFilters = ({ categories = [] }: SidebarFiltersProps) => {
  const { filters, applyFilters } = useFilterParams();
  const DATA_categories = categories.map((c) => ({ name: c.name }));

  const [isOnSale, setIsIsOnSale] = useState(filters.sale);
  const [rangePrices, setRangePrices] = useState<number[]>([
    filters.minPrice ?? PRICE_RANGE[0],
    filters.maxPrice ?? PRICE_RANGE[1],
  ]);
  const [categoriesState, setCategoriesState] = useState<string[]>(filters.category);
  const [colorsState, setColorsState] = useState<string[]>(filters.color);
  const [sizesState, setSizesState] = useState<string[]>(filters.size);
  const [sortOrderStates, setSortOrderStates] = useState<string>(filters.sort ?? "");

  //
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

  //

  // OK
  const renderTabsCategories = () => {
    return (
      <div className="relative flex flex-col pb-8 space-y-4">
        <h3 className="font-semibold mb-2.5">Categories</h3>
        {DATA_categories.map((item) => (
          <div key={item.name} className="">
            <Checkbox
              name={item.name}
              label={item.name}
              defaultChecked={categoriesState.includes(item.name)}
              sizeClassName="w-5 h-5"
              labelClassName="text-sm font-normal"
              onChange={(checked) => handleChangeCategories(checked, item.name)}
            />
          </div>
        ))}
      </div>
    );
  };

  // OK
  const renderTabsColor = () => {
    return (
      <div className="relative flex flex-col py-8 space-y-4">
        <h3 className="font-semibold mb-2.5">Colors</h3>
        {DATA_colors.map((item) => (
          <div key={item.name} className="">
            <Checkbox
              sizeClassName="w-5 h-5"
              labelClassName="text-sm font-normal"
              name={item.name}
              label={item.name}
              defaultChecked={colorsState.includes(item.name)}
              onChange={(checked) => handleChangeColors(checked, item.name)}
            />
          </div>
        ))}
      </div>
    );
  };

  // OK
  const renderTabsSize = () => {
    return (
      <div className="relative flex flex-col py-8 space-y-4">
        <h3 className="font-semibold mb-2.5">Sizes</h3>
        {DATA_sizes.map((item) => (
          <div key={item.name} className="">
            <Checkbox
              name={item.name}
              label={item.name}
              defaultChecked={sizesState.includes(item.name)}
              onChange={(checked) => handleChangeSizes(checked, item.name)}
              sizeClassName="w-5 h-5"
              labelClassName="text-sm font-normal"
            />
          </div>
        ))}
      </div>
    );
  };

  // OK
  const renderTabsPriceRage = () => {
    return (
      <div className="relative flex flex-col py-8 space-y-5 pr-3">
        <div className="space-y-5">
          <span className="font-semibold">Price range</span>
          <Slider
            range
            min={PRICE_RANGE[0]}
            max={PRICE_RANGE[1]}
            step={1}
            defaultValue={[rangePrices[0], rangePrices[1]]}
            allowCross={false}
            onChange={(_input: number | number[]) =>
              handleChangePriceRange(_input as number[])
            }
            onAfterChange={commitPriceRange}
          />
        </div>

        <div className="flex justify-between space-x-5">
          <div>
            <label
              htmlFor="minPrice"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Min price
            </label>
            <div className="mt-1 relative rounded-md">
              <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-neutral-500 sm:text-sm">
                $
              </span>
              <input
                type="text"
                name="minPrice"
                disabled
                id="minPrice"
                className="block w-32 pr-10 pl-4 sm:text-sm border-neutral-200 dark:border-neutral-700 rounded-full bg-transparent"
                value={rangePrices[0]}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="maxPrice"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Max price
            </label>
            <div className="mt-1 relative rounded-md">
              <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-neutral-500 sm:text-sm">
                $
              </span>
              <input
                type="text"
                disabled
                name="maxPrice"
                id="maxPrice"
                className="block w-32 pr-10 pl-4 sm:text-sm border-neutral-200 dark:border-neutral-700 rounded-full bg-transparent"
                value={rangePrices[1]}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // OK
  const renderTabsSortOrder = () => {
    return (
      <div className="relative flex flex-col py-8 space-y-4">
        <h3 className="font-semibold mb-2.5">Sort order</h3>
        {DATA_sortOrderRadios.map((item) => (
          <Radio
            id={item.id}
            key={item.id}
            name="radioNameSort"
            label={item.name}
            defaultChecked={sortOrderStates === item.id}
            sizeClassName="w-5 h-5"
            onChange={handleChangeSortOrder}
            className="!text-sm"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700">
      {renderTabsCategories()}
      {renderTabsColor()}
      {renderTabsSize()}
      {renderTabsPriceRage()}
      <div className="py-8 pr-2">
        <MySwitch
          label="On sale!"
          desc="Products currently on sale"
          enabled={isOnSale}
          onChange={handleChangeOnSale}
        />
      </div>
      {renderTabsSortOrder()}
    </div>
  );
};

export default SidebarFilters;
