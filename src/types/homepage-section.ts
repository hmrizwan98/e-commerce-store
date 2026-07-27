export type HomepageSectionType =
  | "hero"
  | "discoverMore"
  | "howItWork"
  | "promo"
  | "featuredProducts"
  | "newArrivals"
  | "bestSellers"
  | "onSale"
  | "exploreGrid"
  | "largeProductSlider"
  | "collections"
  | "featureItemsGrid"
  | "blog"
  | "testimonials"
  | "newsletter"
  | "brands"
  | "socialGallery";

/** Generic content tile used by tile-list sections (discoverMore, howItWork, socialGallery). */
export interface HomepageTile {
  id: string;
  image?: string;
  /** Short emoji/text icon, used instead of (or alongside) an image for lightweight tiles like How It Works steps. */
  icon?: string;
  title?: string;
  subtitle?: string;
  href?: string;
}

export interface HomepageSectionConfig {
  heading?: string;
  subHeading?: string;
  /** "auto" (default) keeps the existing flag/homepage-flag-based query; "manual" uses categoryIds/productIds below. */
  mode?: "auto" | "manual";
  categoryIds?: string[];
  productIds?: string[];
  bannerIds?: string[];
  limit?: number;
  /** Grid layout controls for category/grid-style sections (exploreGrid, collections). */
  columns?: number;
  showProductCount?: boolean;
  viewAllText?: string;
  viewAllHref?: string;
  /** Only used by type "promo" - picks which of the 3 promo banner layouts/placements to render. */
  variant?: 1 | 2 | 3;
  /** Tile content for discoverMore, howItWork, socialGallery. */
  items?: HomepageTile[];
}

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  title: string;
  order: number;
  isActive: boolean;
  config: HomepageSectionConfig;
  createdAt?: number;
  updatedAt?: number;
}
