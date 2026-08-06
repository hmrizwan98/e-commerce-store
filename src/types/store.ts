import type { DomainSetting } from "./domain-settings";

export type StoreStatus = "active" | "suspended" | "archived";
export type StoreTemplate = "empty" | "demo";

export interface StoreSubscription {
  plan?: string;
  expiryDate?: number;
}

export interface Store {
  id: string;
  name: string;
  /** Optional display/brand name, distinct from the legal/account `name` - falls back to `name`
   * wherever a storefront-facing name is needed (e.g. siteSettings/general's storeName at creation). */
  brandName?: string;
  /** Lowercased, computed server-side on every create/update - never client-submitted. Used by searchStores(). */
  nameLower?: string;
  slug: string;
  websiteUrl?: string;
  adminUrl?: string;
  /** Custom hostnames this store also resolves on (e.g. "abcstore.com"), in addition to the {slug}.ROOT_DOMAIN subdomain.
   * Kept as a plain string[] - src/lib/tenant/current.ts queries it with array-contains, so its shape must not change. */
  domains?: string[];
  /** DNS/SSL/primary/redirect metadata per hostname in `domains`, keyed by hostname - additive,
   * kept in sync with `domains` by src/lib/superadmin/domain-settings.ts. Never used for tenant resolution. */
  domainSettings?: Record<string, DomainSetting>;
  logo?: string;
  email?: string;
  ownerName?: string;
  phone?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  language?: string;
  themeId?: string;
  status: StoreStatus;
  subscription?: StoreSubscription;
  storageLimit?: number;
  cloudinaryFolder: string;
  /** Notes-only for phase 1 - every store shares one Firebase project (see tenant-scope.ts). */
  firebaseProject?: string;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
  expiryDate?: number;
  /** Set when status is transitioned to "archived" (soft delete - subcollections/Cloudinary assets are kept). */
  archivedAt?: number;
}
