import { THEME_PRESETS } from "@/lib/themes/theme-presets";
import type { Testimonial } from "@/types/testimonial";

/**
 * Sample testimonials the store installer writes for every new store (e.g. "Jordan Smith -
 * Great products and excellent customer service."). They are not real customers, so an
 * UNCHANGED sample is never shown on the storefront. Admin labels it "Sample – hidden on
 * storefront"; once the merchant edits the name or the text it is their own testimonial and
 * shows normally. Exact match on name + text against every preset's seed list - no data is
 * changed or deleted.
 */
const norm = (v: string | undefined | null) => (v ?? "").trim();

export const SEED_TESTIMONIAL_KEYS: ReadonlySet<string> = new Set(
  Object.values(THEME_PRESETS).flatMap((preset) =>
    (preset.testimonials ?? []).map((t) => `${norm(t.clientName)}\u0000${norm(t.content)}`)
  )
);

export function isSeedTestimonial(t: Pick<Testimonial, "clientName" | "content"> | null | undefined): boolean {
  if (!t) return false;
  return SEED_TESTIMONIAL_KEYS.has(`${norm(t.clientName)}\u0000${norm(t.content)}`);
}

/** What the storefront may show: active, not an unchanged sample, and with real text. */
export function isPublicTestimonial(t: Pick<Testimonial, "clientName" | "content" | "isActive"> | null | undefined): boolean {
  return Boolean(t && t.isActive === true && norm(t.content) && norm(t.clientName) && !isSeedTestimonial(t));
}
