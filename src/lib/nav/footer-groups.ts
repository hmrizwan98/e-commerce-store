/**
 * Turns the store's footer menu (Content → Menus → Footer) into tidy link columns.
 * - A menu item with sub-links becomes its own column (heading = item name).
 * - Plain links are grouped: help/policy pages under "Customer care", everything else under
 *   "Shop". (Rendering every plain link as a column heading is what made the footer look
 *   scattered.) Only the store's own links are used; headings are platform labels.
 */
export interface FooterLink {
  name: string;
  href: string;
  targetBlank?: boolean;
}
export interface FooterMenuItemLike extends FooterLink {
  children?: FooterMenuItemLike[];
}
export interface FooterGroup {
  title: string;
  links: FooterLink[];
}

const CARE = /^\/(pages\/.+|(contact|faq|privacy|terms|refund|returns?|shipping|order-tracking|track|help|support)(\/|$|\?|#|-))/i;

export function isCustomerCareLink(href: string): boolean {
  return CARE.test((href || "").trim());
}

export function groupFooterMenu(items: FooterMenuItemLike[]): FooterGroup[] {
  const groups: FooterGroup[] = [];
  const shop: FooterLink[] = [];
  const care: FooterLink[] = [];
  const toLink = (i: FooterMenuItemLike): FooterLink => ({ name: i.name, href: i.href, ...(i.targetBlank ? { targetBlank: true } : {}) });
  for (const item of items) {
    if (!item?.name) continue;
    const children = (item.children ?? []).filter((c) => c?.name && c?.href);
    if (children.length) groups.push({ title: item.name, links: children.map(toLink) });
    else if (item.href) (isCustomerCareLink(item.href) ? care : shop).push(toLink(item));
  }
  const flat: FooterGroup[] = [];
  if (shop.length) flat.push({ title: "Shop", links: shop });
  if (care.length) flat.push({ title: "Customer care", links: care });
  return [...flat, ...groups];
}
