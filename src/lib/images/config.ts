// A local file under public/ - never an external URL - so a missing/slow
// third-party image host can't ever break product/category/brand rendering.
// PNG (not SVG): next/image blocks SVG optimization by default, which needs
// extra config (dangerouslyAllowSVG/CSP) to lift - a plain raster file avoids
// that entirely and works everywhere with zero special-casing.
export const PLACEHOLDER_IMAGE_URL =
  process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL ?? "/images/placeholder.png";
