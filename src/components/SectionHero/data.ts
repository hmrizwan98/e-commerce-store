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
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    heading: "New Season Collection 2026",
    subHeading: "Discover modern luxury and handcrafted style 🔥",
    btnText: "Shop Collection",
    btnLink: "/search" as Route,
  },
  {
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80",
    heading: "Exclusive Minimalist Essentials",
    subHeading: "Up to 40% off on selected items",
    btnText: "Explore Now",
    btnLink: "/search" as Route,
  },
  {
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1600&q=80",
    heading: "Premium Footwear & Accessories",
    subHeading: "Designed for everyday life & comfort",
    btnText: "View Trending",
    btnLink: "/search" as Route,
  },
];
