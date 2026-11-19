/**
 * Filter options built from the store's OWN products (colours, sizes, price range, categories
 * that actually have products). Pure - shared by the server repository and the tests.
 */
export interface FacetProduct {
  price?: number;
  colorFacets?: string[];
  sizeFacets?: string[];
  categoryIds?: string[];
}

export interface FilterFacets {
  colors: string[];
  sizes: string[];
  /** [floor(min), ceil(max)] of product prices, or null when there is no usable range. */
  priceRange: [number, number] | null;
  /** Category ids that have at least one active product. */
  categoryIds: string[];
}

const SIZE_ORDER = ["xxs", "xs", "s", "m", "l", "xl", "xxl", "xxxl", "2xl", "3xl", "4xl"];

const clean = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : "");

export function buildFilterFacets(products: FacetProduct[]): FilterFacets {
  const colors = new Set<string>();
  const sizes = new Set<string>();
  const categoryIds = new Set<string>();
  let min = Infinity;
  let max = -Infinity;
  for (const p of products) {
    for (const c of p.colorFacets ?? []) if (clean(c)) colors.add(clean(c));
    for (const s of p.sizeFacets ?? []) if (clean(s)) sizes.add(clean(s));
    for (const id of p.categoryIds ?? []) if (id) categoryIds.add(id);
    if (typeof p.price === "number" && Number.isFinite(p.price) && p.price >= 0) {
      min = Math.min(min, p.price);
      max = Math.max(max, p.price);
    }
  }
  const sizeRank = (s: string) => {
    const i = SIZE_ORDER.indexOf(s);
    return i === -1 ? SIZE_ORDER.length : i;
  };
  return {
    colors: Array.from(colors).sort(),
    sizes: Array.from(sizes).sort((a, b) => sizeRank(a) - sizeRank(b) || a.localeCompare(b, undefined, { numeric: true })),
    priceRange: Number.isFinite(min) && max > min ? [Math.floor(min), Math.ceil(max)] : null,
    categoryIds: Array.from(categoryIds),
  };
}

/** Only categories that have products (a store with fewer categories shows only those). */
export function categoriesWithProducts<T extends { id: string }>(categories: T[], facets: Pick<FilterFacets, "categoryIds">): T[] {
  const ids = new Set(facets.categoryIds);
  return categories.filter((c) => ids.has(c.id));
}

/** "sky blue" -> "Sky Blue", "xl" -> "XL" (short size codes upper-cased). */
export function facetLabel(value: string): string {
  const v = value.trim();
  if (/^(x{0,3}[sml]|\d?x{1,3}l)$/i.test(v)) return v.toUpperCase();
  return v.replace(/\b\p{L}/gu, (ch) => ch.toUpperCase());
}

export interface ClientFilterState {
  color: string[];
  size: string[];
  minPrice?: number;
  maxPrice?: number;
  sale: boolean;
  sort?: string;
}

export interface FilterableProduct extends FacetProduct {
  compareAtPrice?: number;
  isOnSale?: boolean;
  rating?: number;
  isFeatured?: boolean;
  createdAt?: number;
}

/** Same filters as the collection page (URL params), applied to an already-loaded list - used
 * by the homepage "What's trending" grid, whose products aren't re-queried from the URL. */
export function applyClientFilters<T extends FilterableProduct>(products: T[], f: ClientFilterState): T[] {
  const colors = f.color.map((c) => c.toLowerCase());
  const sizes = f.size.map((s) => s.toLowerCase());
  const out = products.filter((p) => {
    if (colors.length && !(p.colorFacets ?? []).some((c) => colors.includes(c.toLowerCase()))) return false;
    if (sizes.length && !(p.sizeFacets ?? []).some((s) => sizes.includes(s.toLowerCase()))) return false;
    const price = p.price ?? 0;
    if (f.minPrice !== undefined && price < f.minPrice) return false;
    if (f.maxPrice !== undefined && price > f.maxPrice) return false;
    if (f.sale && !(p.isOnSale || (p.compareAtPrice ?? 0) > price)) return false;
    return true;
  });
  const by: Record<string, (a: T, b: T) => number> = {
    "price-asc": (a, b) => (a.price ?? 0) - (b.price ?? 0),
    "price-desc": (a, b) => (b.price ?? 0) - (a.price ?? 0),
    newest: (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
    rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    featured: (a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)),
  };
  return f.sort && by[f.sort] ? [...out].sort(by[f.sort]) : out;
}
