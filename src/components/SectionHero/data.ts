import Image, { StaticImageData } from 'next/image';
import { Route } from '@/routers/types';
import imageRightPng from '@/images/hero-right.png';
import imageRightPng2 from '@/images/hero-right-2.png';
import imageRightPng3 from '@/images/hero-right-3.png';
import type { BannerAnimation, BannerTextAlign } from '@/types/banner';

export interface Hero2DataType {
  image: StaticImageData | string;
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

export const HERO2_DEMO_DATA: Hero2DataType[] = [
  {
    image: imageRightPng2,
    heading: 'Exclusive collection for everyone',
    subHeading: 'In this season, find the best 🔥',
    btnText: 'Explore now',
    btnLink: '/',
  },
  {
    image: imageRightPng3,
    heading: 'Exclusive collection for everyone',
    subHeading: 'In this season, find the best 🔥',
    btnText: 'Explore now',
    btnLink: '/',
  },
  {
    image: imageRightPng,
    heading: 'Exclusive collection for everyone',
    subHeading: 'In this season, find the best 🔥',
    btnText: 'Explore now',
    btnLink: '/',
  },
];
