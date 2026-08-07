import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { DEFAULT_THEME } from "@/lib/firebase/repositories/themes";
import { getThemePreset, type ThemePresetKey } from "@/lib/themes/theme-presets";
import type { CmsPageStatus } from "@/types/page";
import type { PageSectionType } from "@/types/page-section";
import type { Theme } from "@/types/theme";
import type { StoreTemplate } from "@/types/store";

/**
 * Installs a named theme preset (see src/lib/themes/theme-presets.ts) for a brand-new
 * store: a real active Theme doc, navigation, homepage sections, announcement bar,
 * hero/promo banners, testimonials, FAQs, and CMS pages (privacy/terms/refund/faq) - all
 * pure seed data across EXISTING collections/section types. No new rendering, no new
 * section types - "installing a theme" only ever means writing different configuration
 * into the same places createStore() already wrote a hardcoded default into.
 *
 * When template is "demo", additionally seeds a handful of extra clearly-placeholder
 * testimonials/FAQs and one extra homepage section - metadata only, never products/orders/
 * customers, per the Demo Store requirement.
 */
export async function installDefaultTheme(
  storeDocRef: FirebaseFirestore.DocumentReference,
  opts: { template: StoreTemplate; themeKey: ThemePresetKey },
  stage: (name: string) => void = () => {}
): Promise<void> {
  const preset = getThemePreset(opts.themeKey);

  // Real active Theme doc - shallow-merge each nested object individually (not a blind
  // object spread) so a preset only overriding e.g. `colors` doesn't wipe out
  // DEFAULT_THEME's `buttons`/`header`/etc. This is a one-time, explicit merge, not a
  // generic deep-merge utility - no new "theme engine".
  const mergedTheme: Theme = {
    ...DEFAULT_THEME,
    ...preset.theme,
    id: preset.key,
    name: preset.name,
    isActive: true,
    colors: { ...DEFAULT_THEME.colors, ...preset.theme.colors },
    darkColors: { ...DEFAULT_THEME.darkColors, ...preset.theme.darkColors },
    typography: { ...DEFAULT_THEME.typography, ...preset.theme.typography },
    buttons: { ...DEFAULT_THEME.buttons, ...preset.theme.buttons },
    cards: { ...DEFAULT_THEME.cards, ...preset.theme.cards },
    header: { ...DEFAULT_THEME.header, ...preset.theme.header },
    footer: { ...DEFAULT_THEME.footer, ...preset.theme.footer },
  };
  await storeDocRef
    .collection("themes")
    .doc(preset.key)
    .set({ ...mergedTheme, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  stage("THEME_DOC_WRITTEN");

  // Homepage sections (hero is rendered from the "hero"-placement banner below, not a
  // homepageSections doc of its own - matches the existing rendering in src/app/page.tsx).
  const homepageCol = storeDocRef.collection("homepageSections");
  const sections = [
    { type: "hero", title: "Hero", order: 0, config: {} },
    ...preset.homepageSections,
    ...(opts.template === "demo" ? [{ type: "testimonials" as const, title: "Demo Testimonials", order: 99, config: {} }] : []),
  ];
  await Promise.all(
    sections.map((section) =>
      homepageCol.doc().set({
        ...section,
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    )
  );
  stage("HOMEPAGE_SECTIONS_WRITTEN");

  // Navigation.
  const menusCol = storeDocRef.collection("menus");
  await Promise.all([
    menusCol.doc("header").set({ id: "header", items: preset.navigation.header, updatedAt: FieldValue.serverTimestamp() }),
    menusCol.doc("footer").set({ id: "footer", items: preset.navigation.footer, updatedAt: FieldValue.serverTimestamp() }),
  ]);
  stage("MENUS_WRITTEN");

  // Announcement bar.
  await storeDocRef
    .collection("announcementBars")
    .doc()
    .set({ ...preset.announcementBar, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  stage("ANNOUNCEMENT_BAR_WRITTEN");

  // Hero + promo banners.
  const bannersCol = storeDocRef.collection("banners");
  await Promise.all(
    [preset.heroBanner, ...preset.promoBanners].map((banner) =>
      bannersCol.doc().set({ ...banner, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() })
    )
  );
  stage("BANNERS_WRITTEN");

  // Testimonials + FAQs (base preset content, plus extra demo-only placeholders).
  const testimonialsCol = storeDocRef.collection("testimonials");
  const testimonials = [
    ...preset.testimonials,
    ...(opts.template === "demo"
      ? [{ clientName: "Alex Johnson", content: "Placeholder testimonial - replace with a real customer quote.", rating: 5, order: preset.testimonials.length, isActive: true }]
      : []),
  ];
  await Promise.all(
    testimonials.map((t) => testimonialsCol.doc().set({ ...t, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }))
  );
  stage("TESTIMONIALS_WRITTEN");

  const faqsCol = storeDocRef.collection("faqs");
  const faqs = [
    ...preset.faqs,
    ...(opts.template === "demo"
      ? [{ question: "Placeholder question?", answer: "Placeholder answer - replace with real FAQ content.", order: preset.faqs.length, isActive: true }]
      : []),
  ];
  await Promise.all(faqs.map((f) => faqsCol.doc().set({ ...f, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() })));
  stage("FAQS_WRITTEN");

  // CMS pages: privacy/terms/refund (content blobs, existing pattern) + FAQ (one
  // page-builder section, reusing the existing PageSectionType:"faq" renderer).
  // Slugs must match exactly what src/app/privacy|terms|refund/page.tsx query
  // (getPageBySlug("privacy")/("terms")/("refund")) - NOT "privacy-policy" etc.
  const pagesCol = storeDocRef.collection("pages");
  const legalPages: { slug: string; title: string; content: string }[] = [
    { slug: "privacy", title: "Privacy Policy", content: preset.legalPages.privacy },
    { slug: "terms", title: "Terms & Conditions", content: preset.legalPages.terms },
    { slug: "refund", title: "Refund Policy", content: preset.legalPages.refund },
  ];
  await Promise.all(
    legalPages.map((page) =>
      pagesCol.doc().set({
        ...page,
        isActive: true,
        status: "published" satisfies CmsPageStatus,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    )
  );

  const faqPageRef = pagesCol.doc();
  await faqPageRef.set({
    slug: "faq",
    title: "Frequently Asked Questions",
    content: "",
    isActive: true,
    status: "published" satisfies CmsPageStatus,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await faqPageRef.collection("sections").doc().set({
    type: "faq" satisfies PageSectionType,
    title: "FAQ",
    order: 0,
    isActive: true,
    config: { heading: "Frequently Asked Questions" },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  stage("PAGES_WRITTEN");
}
