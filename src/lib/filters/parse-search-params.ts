import "server-only";
import type { SearchProductsParams } from "@/lib/firebase/repositories/products";

export type RawSearchParams = { [key: string]: string | string[] | undefined };

function getAll(searchParams: RawSearchParams, key: string): string[] {
  const value = searchParams[key];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getOne(searchParams: RawSearchParams, key: string): string | undefined {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

const PAGE_SIZE = 12;

export function parseProductSearchParams(
  searchParams: RawSearchParams
): SearchProductsParams {
  const minPriceRaw = getOne(searchParams, "minPrice");
  const maxPriceRaw = getOne(searchParams, "maxPrice");
  const pageRaw = getOne(searchParams, "page");

  return {
    category: getOne(searchParams, "category"),
    color: getAll(searchParams, "color"),
    size: getAll(searchParams, "size"),
    sale: getOne(searchParams, "sale") === "true",
    minPrice: minPriceRaw ? Number(minPriceRaw) : undefined,
    maxPrice: maxPriceRaw ? Number(maxPriceRaw) : undefined,
    sort: getOne(searchParams, "sort") as SearchProductsParams["sort"],
    page: pageRaw ? Math.max(1, Number(pageRaw)) : 1,
    pageSize: PAGE_SIZE,
  };
}

/** Clones the current search params and overwrites `page`, preserving every other active filter. */
export function buildPageHref(searchParams: RawSearchParams, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, value);
    }
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `?${query}` : "";
}
