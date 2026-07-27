import "server-only";
import type { Route } from "@/routers/types";
import type { Category as FirestoreCategory } from "@/types/category";
import type { Banner as FirestoreBanner } from "@/types/banner";
import type { CardCategoryData } from "@/components/SectionSliderCategories/SectionSliderCategories";
import type { Hero2DataType } from "@/components/SectionHero/data";
import type { ExploreType } from "@/components/SectionGridMoreExplore/data";

/**
 * Maps Firestore Category/Banner into the exact shapes the existing,
 * unchanged presentational components already expect (SectionSliderCategories,
 * SectionHero2). Product no longer needs an adapter as of Phase 2 - ProductCard
 * and its consumers now take the canonical Product type directly.
 */

export function toCardCategoryData(category: FirestoreCategory, productCount?: number): CardCategoryData {
  const desc =
    productCount != null
      ? `${category.description ?? ""}${category.description ? " · " : ""}${productCount} products`
      : category.description ?? "";
  return {
    name: category.name,
    desc,
    img: category.image ?? "",
    color: "bg-slate-100",
  };
}

export function toExploreType(category: FirestoreCategory, productCount?: number): ExploreType {
  return {
    id: category.id,
    name: category.name,
    desc: category.description ?? "",
    image: category.image ?? "",
    svgBg: "",
    count: productCount,
  };
}

export function toHeroSlide(banner: FirestoreBanner): Hero2DataType {
  return {
    image: banner.imageDesktop,
    heading: banner.title,
    subHeading: banner.subtitle ?? "",
    btnText: banner.ctaText ?? "Explore now",
    btnLink: (banner.ctaHref ?? "/") as Route,
    description: banner.description,
    badgeText: banner.badgeText,
    offerText: banner.offerText,
    discountText: banner.discountText,
    btnText2: banner.ctaText2,
    btnLink2: banner.ctaHref2 as Route | undefined,
    textAlign: banner.textAlign,
    textColor: banner.textColor,
    overlayColor: banner.overlayColor,
    overlayOpacity: banner.overlayOpacity,
    animation: banner.animation,
  };
}
