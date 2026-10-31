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

/** Theme Collection setting "Products per page" (8/12/16/24); anything else -> 12. */
const ALLOWED_PAGE_SIZES = [8, 12, 16, 24];

export function parseProductSearchParams(
  searchParams: RawSearchParams,
  pageSize: number = PAGE_SIZE
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
    pageSize: ALLOWED_PAGE_SIZES.includes(pageSize) ? pageSize : PAGE_SIZE,
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
