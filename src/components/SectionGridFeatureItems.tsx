import React from "react";
import HeaderFilterSection from "@/components/HeaderFilterSection";
import ThemeProductCardAdapter from "@/components/theme/ThemeProductCardAdapter";
import { getActiveThemeConfig } from "@/lib/theme/theme-repository";
import type { Product } from "@/types/product";

//
export interface SectionGridFeatureItemsProps {
  data?: Product[];
}

async function SectionGridFeatureItems({
  data = [],
}: SectionGridFeatureItemsProps) {
  const theme = await getActiveThemeConfig();

  return (
    <div className="nc-SectionGridFeatureItems relative">
      <HeaderFilterSection />
      <div
        className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 `}
      >
        {data.map((item) => (
          <ThemeProductCardAdapter data={item} productCardSettings={theme.productCard} key={item.id} />
        ))}
      </div>
    </div>
  );
};

export default SectionGridFeatureItems;
