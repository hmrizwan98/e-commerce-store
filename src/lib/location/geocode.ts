/**
 * Browser-side location helpers for checkout: one shared geolocation request per page
 * session (no duplicate permission prompts, no re-asking when the address step remounts)
 * and cached OpenStreetMap Nominatim lookups (free, keyless - the platform's existing
 * geocoder; its usage policy allows light, user-triggered requests like these).
 */
import { mapNominatimItem, hasRoad, type AddressSuggestion, type NominatimItem } from "./address-mapping";

const NOMINATIM = "https://nominatim.openstreetmap.org";

export interface ResolvedPosition {
  lat: number;
  lon: number;
  accuracy: number;
}

export type PositionErrorKind = "unsupported" | "denied" | "unavailable" | "timeout" | "insecure";

export class PositionError extends Error {
  constructor(public kind: PositionErrorKind, message: string) {
    super(message);
  }
}

const POSITION_MESSAGES: Record<PositionErrorKind, string> = {
  unsupported: "Your browser can't share location. Please type your address.",
  insecure: "Location only works on a secure (https) page. Please type your address.",
  denied: "Location permission is blocked. Allow location for this site in your browser settings, or type your address.",
  unavailable: "We couldn't detect your location right now. Please type your address or set it on the map.",
  timeout: "Finding your location took too long. Try again outdoors / with GPS on, or type your address.",
};

let inFlight: Promise<ResolvedPosition> | null = null;
let lastFix: { at: number; pos: ResolvedPosition } | null = null;
const FIX_REUSE_MS = 5 * 60 * 1000;

/** Single geolocation request shared by every caller; a fix from the last 5 minutes is reused. */
export function getCurrentPosition(): Promise<ResolvedPosition> {
  if (lastFix && Date.now() - lastFix.at < FIX_REUSE_MS) return Promise.resolve(lastFix.pos);
  if (inFlight) return inFlight;
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return Promise.reject(new PositionError("unsupported", POSITION_MESSAGES.unsupported));
  }
  if (!window.isSecureContext) return Promise.reject(new PositionError("insecure", POSITION_MESSAGES.insecure));

  inFlight = new Promise<ResolvedPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos = { lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy };
        lastFix = { at: Date.now(), pos };
        resolve(pos);
      },
      (err) => {
        const kind: PositionErrorKind = err.code === err.PERMISSION_DENIED ? "denied" : err.code === err.TIMEOUT ? "timeout" : "unavailable";
        reject(new PositionError(kind, POSITION_MESSAGES[kind]));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** "granted" | "denied" | "prompt" | "unknown" - lets the UI auto-fill only when the
 * shopper already allowed location, instead of prompting on page load. */
export async function geolocationPermission(): Promise<"granted" | "denied" | "prompt" | "unknown"> {
  try {
    const status = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
    return (status?.state as "granted" | "denied" | "prompt") ?? "unknown";
  } catch {
    return "unknown";
  }
}

const searchCache = new Map<string, AddressSuggestion[]>();
const reverseCache = new Map<string, { suggestion: AddressSuggestion; hasRoad: boolean }>();

export async function searchAddresses(query: string, opts: { countryCode?: string; signal?: AbortSignal } = {}): Promise<AddressSuggestion[]> {
  const q = query.trim();
  const key = `${opts.countryCode ?? ""}|${q.toLowerCase()}`;
  const cached = searchCache.get(key);
  if (cached) return cached;
  const params = new URLSearchParams({ format: "jsonv2", q, addressdetails: "1", limit: "5", "accept-language": "en" });
  if (opts.countryCode) params.set("countrycodes", opts.countryCode);
  const res = await fetch(`${NOMINATIM}/search?${params}`, { signal: opts.signal });
  if (!res.ok) throw new Error(`search failed (${res.status})`);
  const data = (await res.json()) as NominatimItem[];
  const mapped = data.map(mapNominatimItem);
  searchCache.set(key, mapped);
  return mapped;
}

export async function reverseGeocode(lat: number, lon: number, signal?: AbortSignal): Promise<{ suggestion: AddressSuggestion; hasRoad: boolean }> {
  const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;
  const cached = reverseCache.get(key);
  if (cached) return cached;
  const params = new URLSearchParams({ format: "jsonv2", lat: String(lat), lon: String(lon), zoom: "18", addressdetails: "1", "accept-language": "en" });
  const res = await fetch(`${NOMINATIM}/reverse?${params}`, { signal });
  if (!res.ok) throw new Error(`reverse failed (${res.status})`);
  const item = (await res.json()) as NominatimItem & { error?: string };
  if (item.error) throw new Error(item.error);
  const result = { suggestion: { ...mapNominatimItem(item), lat, lon }, hasRoad: hasRoad(item) };
  reverseCache.set(key, result);
  return result;
}
