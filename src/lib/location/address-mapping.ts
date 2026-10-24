/**
 * Turns OpenStreetMap Nominatim results into checkout address fields. Pure (no browser or
 * network code) so the mapping rules are unit-tested.
 *
 * Nominatim is the platform's existing (free, keyless) geocoder. For Pakistani addresses it
 * often has no `city` field and puts the administrative unit in `state_district`
 * ("Karachi Division") or `county` ("Malir District") - showing that as the city was the
 * "wrong location" bug. Rules here: prefer a real settlement name, strip administrative
 * suffixes, and never invent a street/house the geocoder didn't return.
 */

export interface AddressSuggestion {
  displayName: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  /** Street-level part (house #, road, area). Empty when the geocoder didn't resolve one. */
  line1: string;
  /** Neighbourhood/area name, useful as a landmark-style hint. */
  area?: string;
  lat?: number;
  lon?: number;
}

export interface NominatimAddress {
  house_number?: string;
  road?: string;
  street?: string;
  pedestrian?: string;
  residential?: string;
  neighbourhood?: string;
  quarter?: string;
  suburb?: string;
  hamlet?: string;
  village?: string;
  town?: string;
  city?: string;
  municipality?: string;
  city_district?: string;
  district?: string;
  county?: string;
  state_district?: string;
  state?: string;
  region?: string;
  province?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
}

export interface NominatimItem {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: NominatimAddress;
}

const ADMIN_SUFFIX = /\s+(division|district|tehsil|taluka|tehsīl|subdivision|cantonment|municipal corporation|metropolitan corporation|city district|zila|zilla)$/i;

/** "Karachi Division" -> "Karachi", "Malir District" -> "Malir". */
export function cleanAdministrativeName(name: string | undefined): string {
  return (name ?? "").trim().replace(ADMIN_SUFFIX, "").trim();
}

function firstNonEmpty(...values: (string | undefined)[]): string {
  for (const v of values) {
    const t = (v ?? "").trim();
    if (t) return t;
  }
  return "";
}

/** Splits each part on commas and keeps every token once ("Muhammadi Colony, Malir" +
 * "Malir" -> "Muhammadi Colony", "Malir"), ignoring case. */
function uniqueParts(parts: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    for (const token of part.split(",")) {
      const t = token.trim();
      const key = t.toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(t);
    }
  }
  return out;
}

/** Best "city / town" for the checkout City field. */
export function pickCity(addr: NominatimAddress): string {
  const settlement = firstNonEmpty(addr.city, addr.town, addr.municipality, addr.village, addr.hamlet);
  if (settlement) return cleanAdministrativeName(settlement);
  // No settlement - use the division/district name without its admin suffix.
  return cleanAdministrativeName(firstNonEmpty(addr.state_district, addr.county, addr.district));
}

export function mapNominatimItem(item: NominatimItem): AddressSuggestion {
  const addr = item.address ?? {};
  const city = pickCity(addr);
  const road = firstNonEmpty(addr.road, addr.street, addr.pedestrian, addr.residential);
  const area = firstNonEmpty(addr.neighbourhood, addr.quarter, addr.suburb, addr.hamlet);
  const district = cleanAdministrativeName(firstNonEmpty(addr.city_district, addr.district));
  const streetPart = [addr.house_number, road].filter(Boolean).join(" ").trim();
  const line1 = uniqueParts([streetPart, area, district].filter(Boolean))
    .filter((p) => p.toLowerCase() !== city.toLowerCase())
    .join(", ");
  return {
    displayName: item.display_name ?? [line1, city].filter(Boolean).join(", "),
    city,
    state: cleanAdministrativeName(firstNonEmpty(addr.state, addr.province, addr.region)),
    country: firstNonEmpty(addr.country),
    postalCode: firstNonEmpty(addr.postcode),
    line1,
    area: area || undefined,
    lat: item.lat ? Number(item.lat) : undefined,
    lon: item.lon ? Number(item.lon) : undefined,
  };
}

/**
 * How much of a GPS-derived address can be trusted:
 * - "street": precise fix and the geocoder returned a road - fill street + city.
 * - "area": usable fix but no road, or a fix of a few hundred metres - fill area + city,
 *   ask for the street.
 * - "city": coarse fix (> 2 km, typical of Wi-Fi/IP location) - fill city/state only.
 */
export type LocationConfidence = "street" | "area" | "city";

export function locationConfidence(accuracyMeters: number | undefined, suggestion: AddressSuggestion, hasRoad: boolean): LocationConfidence {
  const acc = accuracyMeters ?? Infinity;
  if (acc <= 150 && hasRoad) return "street";
  if (acc <= 2000 && (hasRoad || suggestion.area)) return "area";
  return "city";
}

export function hasRoad(item: NominatimItem): boolean {
  const a = item.address ?? {};
  return Boolean(a.road || a.street || a.pedestrian || a.residential);
}

/** Line 1 to fill for a given confidence - never more precise than the fix supports. */
export function line1ForConfidence(suggestion: AddressSuggestion, confidence: LocationConfidence): string {
  if (confidence === "street") return suggestion.line1;
  if (confidence === "area") return suggestion.area ?? "";
  return "";
}

/** ISO country code for Nominatim's `countrycodes` filter from the checkout country name. */
export function countryCodeFor(countryName: string): string | undefined {
  const map: Record<string, string> = {
    pakistan: "pk",
    "united arab emirates": "ae",
    "saudi arabia": "sa",
    "united states": "us",
    "united kingdom": "gb",
    canada: "ca",
  };
  return map[countryName.trim().toLowerCase()];
}
