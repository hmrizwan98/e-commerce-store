"use client";

import { useEffect, useState } from "react";
import SectionSliderProductCard from "@/components/SectionSliderProductCard";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { fetchProductsByIds } from "@/lib/firebase/client-data/products";
import type { Product } from "@/types/product";

const RecentlyViewedSection: React.FC<{ excludeProductId?: string }> = ({
  excludeProductId,
}) => {
  const { ids } = useRecentlyViewed();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const otherIds = ids.filter((id) => id !== excludeProductId);
    if (!otherIds.length) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    fetchProductsByIds(otherIds).then((result) => {
      if (!cancelled) setProducts(result);
    });
    return () => {
      cancelled = true;
    };
  }, [ids, excludeProductId]);

  if (!products.length) return null;

  return (
    <SectionSliderProductCard
      heading="Recently viewed"
      subHeading=""
      headingFontClassName="text-2xl font-semibold"
      headingClassName="mb-10 text-neutral-900 dark:text-neutral-50"
      data={products}
    />
  );
};

export default RecentlyViewedSection;
