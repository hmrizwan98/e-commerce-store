/**
 * Color/size vocabulary for the collection/search filters. Static for now
 * (matches what scripts/seed.ts actually seeds as colorFacets/sizeFacets) -
 * revisit by deriving from a live product scan if the catalog's attribute
 * vocabulary grows beyond what's practical to hardcode here.
 */
export const FILTER_COLORS = ["Violet", "Yellow", "Orange", "Sky Blue", "Green"];

export const FILTER_SIZES = ["XS", "S", "M", "L", "XL"];

export const PRICE_RANGE: [number, number] = [1, 500];

export const SORT_OPTIONS: { id: string; name: string }[] = [
  { id: "featured", name: "Most Popular" },
  { id: "rating", name: "Best Rating" },
  { id: "newest", name: "Newest" },
  { id: "price-asc", name: "Price Low - High" },
  { id: "price-desc", name: "Price High - Low" },
];
