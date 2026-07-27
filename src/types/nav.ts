export type NavLinkType =
  | "manual"
  | "page"
  | "product"
  | "category"
  | "brand"
  | "anchor"
  | "email"
  | "phone";

export interface NavItem {
  id: string;
  name: string;
  href: string;
  targetBlank?: boolean;
  nofollow?: boolean;
  children?: NavItem[];
  type?: "dropdown" | "megaMenu" | "none";
  isNew?: boolean;
  /** How `href` was produced. "manual" (default/legacy) = admin typed it directly;
   * anything else means `href` is auto-generated from the picked entity below,
   * and should be recomputed whenever that entity's slug changes. */
  linkType?: NavLinkType;
  /** slug of the referenced page/product/category/brand, when linkType is one of those. */
  linkRefSlug?: string;
}

export interface Menu {
  id: "header" | "footer";
  items: NavItem[];
  updatedAt?: number;
}
