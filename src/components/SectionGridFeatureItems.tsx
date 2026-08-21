"use client";

import React, { useState } from "react";
import HeaderFilterSection from "@/components/HeaderFilterSection";
import ThemeProductCardAdapter from "@/components/theme/ThemeProductCardAdapter";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

export interface SectionGridFeatureItemsProps {
  heading?: string;
  subHeading?: string;
  data?: Product[];
  categories?: (Category | { id: string; name: string })[];
  productCardSettings?: any;
}

export default function SectionGridFeatureItems({
  heading = "What's trending now",
  subHeading = "Discover our curated collection of featured products.",
  data = [],
  categories = [],
  productCardSettings,
}: SectionGridFeatureItemsProps) {
  const [activeTab, setActiveTab] = useState("All items");

  // Build dynamic category tabs list
  const categoryNames = (categories ?? []).map((c) => c.name).filter(Boolean);
  const tabs = ["All items", ...categoryNames];

  // Dynamic filtering based on active category tab
  const selectedCatObj = categories.find((c) => c.name.toLowerCase() === activeTab.toLowerCase());

  const filteredProducts = data.filter((product) => {
    if (activeTab === "All items") return true;
    if (selectedCatObj && product.categoryIds?.includes(selectedCatObj.id)) {
      return true;
    }
    const catName = activeTab.toLowerCase();
    const tags = product.tags?.map((t) => t.toLowerCase()) ?? [];
    const name = product.name?.toLowerCase() ?? "";
    return tags.some((t) => t.includes(catName)) || name.includes(catName);
  });

  const displayProducts = activeTab === "All items" ? data : filteredProducts;

  return (
    <div className="nc-SectionGridFeatureItems relative">
      <HeaderFilterSection
        heading={heading}
        subHeading={subHeading}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />
      
      {displayProducts.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayProducts.map((item) => (
            <ThemeProductCardAdapter
              data={item}
              productCardSettings={productCardSettings}
              key={item.id}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base">
            No products found matching &ldquo;{activeTab}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setActiveTab("All items")}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
          >
            View all items &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
