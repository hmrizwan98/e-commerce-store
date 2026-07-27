"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { Route } from "@/routers/types";

export interface ProductFilterState {
  category: string[];
  color: string[];
  size: string[];
  minPrice?: number;
  maxPrice?: number;
  sale: boolean;
  sort?: string;
}

export type ProductFilterPatch = Partial<{
  category: string[];
  color: string[];
  size: string[];
  minPrice: number | undefined;
  maxPrice: number | undefined;
  sale: boolean;
  sort: string | undefined;
}>;

/**
 * Reads/writes product filters as URL search params, so collection/search
 * pages stay SSR-rendered, shareable and back-button-correct instead of
 * holding filter state in memory only. Any filter change resets `page` back
 * to 1 (the current page's results are no longer valid once the set changes).
 */
export function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: ProductFilterState = useMemo(() => {
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    return {
      category: searchParams.getAll("category"),
      color: searchParams.getAll("color"),
      size: searchParams.getAll("size"),
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sale: searchParams.get("sale") === "true",
      sort: searchParams.get("sort") ?? undefined,
    };
  }, [searchParams]);

  const applyFilters = useCallback(
    (patch: ProductFilterPatch) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        params.delete(key);
        if (value === undefined || value === false || value === "") continue;
        if (Array.isArray(value)) {
          value.forEach((v) => v && params.append(key, v));
        } else {
          params.set(key, String(value));
        }
      }
      params.delete("page");
      const query = params.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as Route, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push(pathname as Route, { scroll: false });
  }, [pathname, router]);

  return { filters, applyFilters, clearAll };
}
