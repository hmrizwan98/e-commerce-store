import React, { FC } from "react";
import HeaderFilterSection from "@/components/HeaderFilterSection";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

//
export interface SectionGridFeatureItemsProps {
  data?: Product[];
}

const SectionGridFeatureItems: FC<SectionGridFeatureItemsProps> = ({
  data = [],
}) => {
  return (
    <div className="nc-SectionGridFeatureItems relative">
      <HeaderFilterSection />
      <div
        className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 `}
      >
        {data.map((item) => (
          <ProductCard data={item} key={item.id} />
        ))}
      </div>
    </div>
  );
};

export default SectionGridFeatureItems;
