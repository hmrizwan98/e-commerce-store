import { THEME_PRESETS } from "@/lib/themes/theme-presets";
import type { Banner } from "@/types/banner";
import { isPlaceholderImage } from "@/lib/images/real-image";

/**
 * Identifies installer SAMPLE content so Store Admin can label it. Banners and FAQs are only
 * LABELLED (they stay visible on the storefront until the merchant edits or removes them -
 * approved decision); unchanged sample testimonials are hidden (see lib/testimonials/seed.ts).
 * Nothing here changes or deletes data.
 */
const norm = (v: string | undefined | null) => (v ?? "").trim();

/** Installer sample banners use stock photos from images.unsplash.com; merchant uploads go to
 * the store's own Cloudinary folder. A banner still showing a stock photo is sample content. */
export function isSampleBanner(b: Pick<Banner, "imageDesktop" | "imageMobile"> | null | undefined): boolean {
  if (!b) return false;
  return [b.imageDesktop, b.imageMobile].some((u) => /^https?:\/\/images\.unsplash\.com\//i.test(norm(u)) || isPlaceholderImage(u));
}

const SEED_FAQ_KEYS: ReadonlySet<string> = new Set(
  Object.values(THEME_PRESETS).flatMap((p) => (p.faqs ?? []).map((f) => `${norm(f.question)}\u0000${norm(f.answer)}`))
);

/** An FAQ whose question AND answer are still exactly the installer's sample text (these make
 * example shipping/return claims the merchant never confirmed). */
export function isSeedFaq(f: { question?: string; answer?: string } | null | undefined): boolean {
  if (!f) return false;
  return SEED_FAQ_KEYS.has(`${norm(f.question)}\u0000${norm(f.answer)}`);
}
