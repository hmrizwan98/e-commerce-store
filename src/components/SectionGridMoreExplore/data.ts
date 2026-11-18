import { StaticImageData } from "next/image";
//

export interface ExploreType {
  id: number | string;
  name: string;
  desc: string;
  image: string | StaticImageData;
  svgBg: string;
  color?: string;
  count?: number;
  /** Real category page (/category/{slug}). */
  href?: string;
}
