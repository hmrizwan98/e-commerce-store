import type { HomepageSection } from "@/types/homepage-section";

/** Active sections in editor order (same rule as getActiveHomepageSections). */
export function activeSectionsInOrder(sections: HomepageSection[]): HomepageSection[] {
  return sections.filter((s) => s.isActive !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Built-in rows of the collection / product page section lists - those are rendered by the
 * page itself (via showBottomPromo / showFeaturedSection / showRelatedProducts). */
export const BUILT_IN_PAGE_SECTION_IDS = ["sec-col-promo", "sec-col-categories", "sec-prod-promo", "sec-prod-related"];

/** Sections the admin ADDED to the collection / product page (Customizer -> Page Sections):
 * active ones, in editor order. Rendered below the page's own content. */
export function extraPageSections(sections: HomepageSection[] | undefined): HomepageSection[] {
  return activeSectionsInOrder((sections ?? []).filter((s) => !BUILT_IN_PAGE_SECTION_IDS.includes(s.id)));
}

/** The product page's built-in promo slot ("Special Offer Banner" in Customizer → Product page). */
export const PRODUCT_PROMO_SECTION_ID = "sec-prod-promo";

/**
 * Sections rendered below a product page, in Customizer order: the built-in promo (enabled by
 * "Promotional Deals Banner"; its heading/text/image/button edits in the Customizer apply, and
 * it defaults to the Promo Banner 2 slot as before) plus any sections the merchant added.
 * "Customers Also Purchased" and reviews / recently viewed stay inside the product page itself.
 */
export function productPageSections(productDetail?: { sections?: HomepageSection[]; showBottomPromo?: boolean }): HomepageSection[] {
  const showPromo = productDetail?.showBottomPromo ?? true;
  const list: HomepageSection[] = productDetail?.sections ?? [
    { id: PRODUCT_PROMO_SECTION_ID, type: "promo", title: "Special Offer Banner", order: 0, isActive: showPromo, config: {} },
  ];
  return activeSectionsInOrder(
    list
      .filter((s) => s.id !== "sec-prod-related")
      .map((s) =>
        s.id === PRODUCT_PROMO_SECTION_ID
          ? { ...s, type: "promo" as const, isActive: showPromo, config: { variant: 2 as const, ...(s.config ?? {}) } }
          : s
      )
      .filter((s) => s.id === PRODUCT_PROMO_SECTION_ID || !BUILT_IN_PAGE_SECTION_IDS.includes(s.id))
  );
}

