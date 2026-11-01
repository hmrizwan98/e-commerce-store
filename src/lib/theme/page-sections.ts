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
