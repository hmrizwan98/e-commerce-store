/**
 * Guards for writing theme configs to Firestore with `set(..., { merge: true })`.
 *
 * With merge, an EMPTY map (e.g. a preset's `logos: {}`) replaces the whole stored map -
 * reproduced in the Firestore emulator: logos {logoLight, favicon} merged with logos {}
 * became {}. So empty maps are dropped before writing, and applying a preset never carries
 * the merchant's own brand assets.
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

/** Recursively removes keys whose value is an empty plain object (arrays and other values untouched). */
export function stripEmptyObjects<T>(value: T): T {
  if (!isPlainObject(value)) return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    if (isPlainObject(v)) {
      const cleaned = stripEmptyObjects(v);
      if (Object.keys(cleaned as object).length === 0) continue;
      out[k] = cleaned;
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

/** Theme preset WITHOUT the merchant's brand assets (logos, footer logo): applying or resetting
 * a design must never replace a store's own logo/favicon. */
export function withoutMerchantAssets<T extends { logos?: unknown; footer?: { footerLogo?: unknown } }>(preset: T): T {
  const { logos: _logos, ...rest } = preset as T & { logos?: unknown };
  const footer = rest.footer ? { ...rest.footer } : undefined;
  if (footer) delete (footer as { footerLogo?: unknown }).footerLogo;
  return { ...rest, ...(footer ? { footer } : {}) } as T;
}

/** Fields that belong to the Customizer's homepage-section staging copy - never published into
 * the theme docs and cleared from the draft after a publish (the live sections live in the
 * homepageSections collection). */
export const SECTION_STAGING_KEYS = ["homepageSections", "homepageSectionsBaseline"] as const;

export function withoutSectionStaging<T extends Record<string, unknown>>(config: T): T {
  const copy = { ...config };
  for (const k of SECTION_STAGING_KEYS) delete copy[k];
  return copy;
}

/**
 * A source store's theme doc (themeSettings/active or /draft) prepared for Clone Store:
 * the design (preset, colors, fonts, header/footer, layout...) is copied, but never the
 * source merchant's brand assets (logos, favicon, footer logo), the Customizer's section
 * staging copy (the clone gets its own sections) or the source's timestamps.
 */
export function themeConfigForClone(raw: Record<string, unknown>): Record<string, unknown> {
  const { updatedAt: _u, createdAt: _c, publishedAt: _p, ...rest } = withoutSectionStaging(raw);
  return stripEmptyObjects(withoutMerchantAssets(rest as { logos?: unknown; footer?: { footerLogo?: unknown } }) as Record<string, unknown>);
}

/** Legacy Settings → Branding fields -> their Theme Customizer logo slot. */
export const LEGACY_BRANDING_LOGO_FIELDS = {
  logoUrl: "logoLight",
  faviconUrl: "favicon",
  loadingLogoUrl: "loadingLogo",
} as const;
export type LegacyBrandingLogoField = keyof typeof LEGACY_BRANDING_LOGO_FIELDS;

/**
 * Whether a legacy Branding logo URL may be copied into the theme: only an https URL, and only
 * when the theme slot is empty - an existing Customizer logo is never replaced.
 */
export function legacyLogoAdoption(
  field: string,
  legacyValue: unknown,
  themeLogos: Partial<Record<string, string | undefined>>
): { ok: true; key: string; value: string } | { ok: false; error: string } {
  if (!(field in LEGACY_BRANDING_LOGO_FIELDS)) return { ok: false, error: "Unknown field." };
  const key = LEGACY_BRANDING_LOGO_FIELDS[field as LegacyBrandingLogoField];
  const value = typeof legacyValue === "string" ? legacyValue.trim() : "";
  if (!/^https:\/\/\S+$/i.test(value) || value.length > 2000) return { ok: false, error: "The saved value isn't a usable https image URL." };
  if (themeLogos[key]) return { ok: false, error: "Your theme already has this image - nothing was changed." };
  return { ok: true, key, value };
}
