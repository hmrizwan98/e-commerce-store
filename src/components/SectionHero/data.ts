import type { StaticImageData } from 'next/image';
import { Route } from '@/routers/types';
import type { BannerAnimation, BannerBackgroundPosition, BannerTextAlign } from '@/types/banner';

/** One hero slide - always built from a merchant banner (Store Admin → Hero Slides) via
 * toHeroSlide(); there is no demo slide data anymore. */
export interface Hero2DataType {
  image: StaticImageData | string;
  imageMobile?: string;
  backgroundPosition?: BannerBackgroundPosition;
  heading: string;
  subHeading: string;
  btnText: string;
  btnLink: Route;
  description?: string;
  badgeText?: string;
  offerText?: string;
  discountText?: string;
  btnText2?: string;
  btnLink2?: Route;
  textAlign?: BannerTextAlign;
  textColor?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  animation?: BannerAnimation;
}
