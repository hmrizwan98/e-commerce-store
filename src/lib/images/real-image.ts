/**
 * The platform's placeholder image (`/images/placeholder.png`, also used by the store
 * installer for sample promo banners) is not merchant content: treat it as "no image" so a
 * section shows its text only instead of an empty grey picture frame.
 */
export function isPlaceholderImage(url: string | null | undefined): boolean {
  const u = (url ?? "").trim();
  if (!u) return false;
  return /(^|\/)images\/placeholder\.(png|jpe?g|webp|svg)(\?.*)?$/i.test(u);
}

export function realImage(url: string | null | undefined): string | undefined {
  const u = (url ?? "").trim();
  return u && !isPlaceholderImage(u) ? u : undefined;
}
