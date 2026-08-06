"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { useWishlist } from "@/hooks/useWishlist";
import { fetchProductsByIds } from "@/lib/firebase/client-data/products";
import { useTenantId } from "@/lib/tenant/TenantContext";
import type { Product } from "@/types/product";

const AccountSavelists = () => {
  const { ids } = useWishlist();
  const tenantId = useTenantId();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProductsByIds(ids, tenantId).then((result) => {
      if (!cancelled) {
        setProducts(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ids, tenantId]);

  return (
    <div className="space-y-10 sm:space-y-12">
      <div>
        <h2 className="text-2xl sm:text-3xl font-semibold">
          List of saved products
        </h2>
      </div>

      {!loading && !products.length && (
        <div className="flex flex-col items-center py-10 space-y-4">
          <p className="text-neutral-500 dark:text-neutral-400">
            You haven&apos;t saved any products yet.
          </p>
          <Link href={"/collection" as any}>
            <ButtonPrimary>Explore products</ButtonPrimary>
          </Link>
        </div>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 ">
          {products.map((item) => (
            <ProductCard key={item.id} data={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountSavelists;
