"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonThird from "@/shared/Button/ButtonThird";
import Prices from "@/components/Prices";
import { useCompare } from "@/hooks/useCompare";
import { fetchProductsByIds } from "@/lib/firebase/client-data/products";
import type { Product } from "@/types/product";

const PageCompare = () => {
  const { ids, remove, clear } = useCompare();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProductsByIds(ids).then((result) => {
      if (!cancelled) {
        setProducts(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const attributeNames = Array.from(
    new Set(products.flatMap((p) => p.attributes.map((a) => a.name)))
  );

  return (
    <div className="container py-16 lg:pb-28 lg:pt-20 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
          Compare products
        </h1>
        {products.length > 0 && <ButtonThird onClick={clear}>Clear all</ButtonThird>}
      </div>

      {!loading && !products.length && (
        <div className="flex flex-col items-center py-10 space-y-4">
          <p className="text-neutral-500 dark:text-neutral-400">
            You haven&apos;t added any products to compare yet.
          </p>
          <Link href={"/collection" as any}>
            <ButtonPrimary>Explore products</ButtonPrimary>
          </Link>
        </div>
      )}

      {products.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr>
                <th className="w-40" />
                {products.map((p) => (
                  <th key={p.id} className="p-4 text-left align-top min-w-[220px]">
                    <div className="space-y-3">
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                        {p.images[0] && (
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="220px"
                          />
                        )}
                      </div>
                      <Link
                        href={`/product/${p.slug}` as any}
                        className="font-semibold hover:underline block"
                      >
                        {p.name}
                      </Link>
                      <button
                        onClick={() => remove(p.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              <tr>
                <td className="p-4 font-medium text-neutral-500">Price</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4">
                    <Prices price={p.price} />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-neutral-500">Rating</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4">
                    {p.rating ? `${p.rating.toFixed(1)} (${p.numberOfReviews ?? 0})` : "No reviews yet"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-neutral-500">Availability</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4">
                    {p.stock > 0 ? "In stock" : "Sold out"}
                  </td>
                ))}
              </tr>
              {attributeNames.map((name) => (
                <tr key={name}>
                  <td className="p-4 font-medium text-neutral-500">{name}</td>
                  {products.map((p) => {
                    const attr = p.attributes.find((a) => a.name === name);
                    const values = attr
                      ? attr.values
                          .map((v) => (typeof v === "string" ? v : v.label))
                          .join(", ")
                      : "—";
                    return (
                      <td key={p.id} className="p-4">
                        {values}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PageCompare;
