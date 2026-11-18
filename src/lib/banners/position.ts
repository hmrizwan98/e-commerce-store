import type { BannerBackgroundPosition } from "@/types/banner";

/**
 * Maps banner backgroundPosition ("left" | "center" | "right" | "top" | "bottom")
 * to Tailwind object-position utility class for Next.js <Image> and <img> elements.
 */
export function getObjectPositionClass(pos?: BannerBackgroundPosition | string): string {
  switch (pos) {
    case "left":
      return "object-left";
    case "right":
      return "object-right";
    case "top":
      return "object-top";
    case "bottom":
      return "object-bottom";
    case "center":
    default:
      return "object-center";
  }
}

