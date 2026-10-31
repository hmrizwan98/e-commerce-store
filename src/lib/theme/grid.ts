/**
 * Product grid spacing from the theme's "Grid Gap" (Customizer -> Layout & Container).
 * The storefront grids were designed with two spacings - the default 24px gap reproduces both
 * exactly: next to a filter sidebar 24px columns / 32px rows (was gap-x-6 gap-y-8), full-width
 * grids 32px / 40px (was gap-x-8 gap-y-10).
 */
export const GRID_GAP_SIDEBAR = "gap-x-[var(--grid-gap,24px)] gap-y-[calc(var(--grid-gap,24px)_+_8px)]";
export const GRID_GAP_WIDE = "gap-x-[calc(var(--grid-gap,24px)_+_8px)] gap-y-[calc(var(--grid-gap,24px)_+_16px)]";

/** Column classes for the theme's Collection grid settings ("Desktop columns" / "Mobile columns"). */
export function themeGridColsClass(desktopCols?: number, mobileCols?: number): string {
  const desktop =
    desktopCols === 2 ? "lg:grid-cols-2" : desktopCols === 3 ? "lg:grid-cols-3" : desktopCols === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4";
  return `${mobileCols === 1 ? "grid-cols-1" : "grid-cols-2"} sm:grid-cols-2 ${desktop}`;
}

/** Category / search / brand listings: they keep their own responsive columns (2 / 3 / 4) until
 * the admin explicitly sets Collection grid columns, which then apply to every listing. */
export function themeListingColsClass(collection?: { gridColumnsDesktop?: number; gridColumnsMobile?: number }): string {
  if (!collection?.gridColumnsDesktop && !collection?.gridColumnsMobile) return "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  return themeGridColsClass(collection.gridColumnsDesktop ?? 3, collection.gridColumnsMobile ?? 2);
}
