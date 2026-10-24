/**
 * Returning-customer details for guest checkout - kept ONLY in this shopper's own browser
 * (localStorage), and only after they explicitly choose "Save on this device" on the order
 * confirmation screen.
 *
 * Why device-only: storefront checkout is guest checkout (no customer accounts/login), so the
 * server has no way to prove who is asking for an address. Looking addresses up by phone or
 * email would let anyone who knows a number see a stranger's home address. Keeping the copy
 * on the device that placed the order means no other customer can ever reach it, and nothing
 * new is stored server-side. The order itself is still validated by the server as before.
 *
 * Pure helpers + guarded storage access (every read/write is try/catch - private mode or
 * blocked storage simply means "no saved details").
 */

export interface SavedAddress {
  id: string;
  fullName: string;
  line1: string;
  line2: string;
  landmark?: string;
  city: string;
  country: string;
  state: string;
  postalCode: string;
  addressType: "home" | "office";
  lastUsedAt: number;
}

export interface SavedCheckoutProfile {
  v: 1;
  phone: string;
  email: string;
  addresses: SavedAddress[];
  savedAt: number;
}

export type AddressInput = Omit<SavedAddress, "id" | "lastUsedAt">;

export const MAX_SAVED_ADDRESSES = 5;
/** Saved details expire if unused for 180 days. */
export const PROFILE_TTL_MS = 180 * 24 * 60 * 60 * 1000;
const MAX_FIELD = 200;

export function profileStorageKey(storeId: string): string {
  return `webriiz:checkout-profile:v1:${storeId || "default"}`;
}

const clean = (v: unknown, max = MAX_FIELD) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const norm = (v: string) => v.trim().toLowerCase().replace(/\s+/g, " ");

/** Two addresses are "the same" if recipient, street, landmark/line2, city, postcode and
 * country match (case/spacing-insensitive) - used to avoid duplicates. */
export function addressKey(a: Pick<AddressInput, "fullName" | "line1" | "line2" | "city" | "postalCode" | "country">): string {
  return [a.fullName, a.line1, a.line2, a.city, a.postalCode, a.country].map((x) => norm(x ?? "")).join("|");
}

export function isCompleteAddress(a: Partial<AddressInput>): boolean {
  return Boolean(clean(a.fullName) && clean(a.line1) && clean(a.city));
}

function sanitizeAddress(raw: unknown): SavedAddress | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const a: SavedAddress = {
    id: clean(r.id, 64) || randomId(),
    fullName: clean(r.fullName),
    line1: clean(r.line1, 300),
    line2: clean(r.line2, 300),
    landmark: clean(r.landmark, 300) || undefined,
    city: clean(r.city),
    country: clean(r.country) || "Pakistan",
    state: clean(r.state),
    postalCode: clean(r.postalCode, 20),
    addressType: r.addressType === "office" ? "office" : "home",
    lastUsedAt: typeof r.lastUsedAt === "number" && Number.isFinite(r.lastUsedAt) ? r.lastUsedAt : 0,
  };
  return isCompleteAddress(a) ? a : null;
}

/** Validates whatever was in storage; anything malformed, empty or expired -> null. */
export function parseProfile(raw: string | null, now = Date.now()): SavedCheckoutProfile | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object" || (data as { v?: unknown }).v !== 1) return null;
  const d = data as Record<string, unknown>;
  const savedAt = typeof d.savedAt === "number" ? d.savedAt : 0;
  if (!savedAt || now - savedAt > PROFILE_TTL_MS) return null;
  const seen = new Set<string>();
  const addresses = (Array.isArray(d.addresses) ? d.addresses : [])
    .map(sanitizeAddress)
    .filter((a): a is SavedAddress => {
      if (!a) return false;
      const k = addressKey(a);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
    .slice(0, MAX_SAVED_ADDRESSES);
  const profile: SavedCheckoutProfile = { v: 1, phone: clean(d.phone, 40), email: clean(d.email, 254), addresses, savedAt };
  return profile.phone || profile.email || profile.addresses.length ? profile : null;
}

/** Adds (or refreshes) the address used for an order; the same address is never stored
 * twice, the most recently used comes first, and only the latest MAX_SAVED_ADDRESSES are kept. */
export function rememberOrder(
  profile: SavedCheckoutProfile | null,
  order: { phone: string; email: string; address: AddressInput; /** saved address the shopper picked and edited */ editedId?: string | null },
  now = Date.now()
): SavedCheckoutProfile {
  const base: SavedCheckoutProfile = profile ?? { v: 1, phone: "", email: "", addresses: [], savedAt: now };
  const incoming = sanitizeAddress({ ...order.address, id: randomId(), lastUsedAt: now });
  let addresses = base.addresses;
  if (incoming) {
    const key = addressKey(incoming);
    // Same address already saved -> refresh it; otherwise, if the shopper picked a saved
    // address and edited it, the edit replaces that entry; else it's a new address.
    const existing = addresses.find((a) => addressKey(a) === key) ?? addresses.find((a) => order.editedId && a.id === order.editedId);
    const merged: SavedAddress = existing ? { ...incoming, id: existing.id } : incoming;
    addresses = [merged, ...addresses.filter((a) => a.id !== merged.id && addressKey(a) !== key)].slice(0, MAX_SAVED_ADDRESSES);
  }
  return {
    v: 1,
    phone: clean(order.phone, 40) || base.phone,
    email: clean(order.email, 254) || base.email,
    addresses,
    savedAt: now,
  };
}

export function removeAddress(profile: SavedCheckoutProfile, id: string): SavedCheckoutProfile {
  return { ...profile, addresses: profile.addresses.filter((a) => a.id !== id) };
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

// ---- storage (browser only) ----

export function loadProfile(storeId: string): SavedCheckoutProfile | null {
  try {
    return parseProfile(window.localStorage.getItem(profileStorageKey(storeId)));
  } catch {
    return null;
  }
}

export function saveProfile(storeId: string, profile: SavedCheckoutProfile): boolean {
  try {
    window.localStorage.setItem(profileStorageKey(storeId), JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

export function forgetProfile(storeId: string): void {
  try {
    window.localStorage.removeItem(profileStorageKey(storeId));
  } catch {
    // nothing stored / storage blocked
  }
}
