/**
 * Removes menu links that would lead to a page the store doesn't have (e.g. "/about" when the
 * merchant never published an About page). Pure; applied to the server menu AND to the
 * client re-fetch, so a hidden link can't reappear after hydration. Matching ignores a
 * trailing slash, query string and hash.
 */
export interface NavLike {
  href: string;
  children?: NavLike[];
}

function normalize(href: string): string {
  const path = (href || "").split(/[?#]/)[0].trim();
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export function filterNavItems<T extends NavLike>(items: T[], hiddenHrefs: readonly string[]): T[] {
  if (!hiddenHrefs.length) return items;
  const hidden = new Set(hiddenHrefs.map(normalize));
  return items
    .filter((item) => !hidden.has(normalize(item.href)))
    .map((item) => (item.children?.length ? { ...item, children: filterNavItems(item.children as T[], hiddenHrefs) } : item));
}
