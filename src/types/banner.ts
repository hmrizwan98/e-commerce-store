export type BannerPlacement =
  | "hero"
  | "promo1"
  | "promo2"
  | "promo3"
  | "homepage-generic";

export type BannerTextAlign = "left" | "center" | "right";
export type BannerBackgroundPosition = "left" | "center" | "right" | "top" | "bottom";
export type BannerAnimation = "fade" | "slide" | "zoom" | "none";

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaText2?: string;
  ctaHref2?: string;
  badgeText?: string;
  offerText?: string;
  discountText?: string;
  imageDesktop: string;
  imageMobile?: string;
  textAlign?: BannerTextAlign;
  textColor?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  backgroundPosition?: BannerBackgroundPosition;
  animation?: BannerAnimation;
  placement: BannerPlacement;
  order: number;
  startDate?: number;
  endDate?: number;
  isActive: boolean;
  createdAt?: number;
  updatedAt?: number;
}
