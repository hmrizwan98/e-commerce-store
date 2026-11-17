/**
 * Colour attribute values -> what a shopper sees: a readable name and the swatch colour.
 *
 * Product colour values are `{ label, hex? }`. Admins sometimes type only a hex code
 * ("#000000"), which ended up as the label with no `hex`: the page then showed
 * "Black: #000000" and a grey placeholder swatch. These helpers make the storefront show
 * "Black" with a real black swatch, and the product form saves new values correctly.
 */
export const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value.trim());
}

const NAMED_COLORS: [string, string][] = [
  ["black", "#000000"],
  ["white", "#ffffff"],
  ["red", "#ef4444"],
  ["maroon", "#7f1d1d"],
  ["blue", "#3b82f6"],
  ["navy", "#1e3a8a"],
  ["sky", "#0ea5e9"],
  ["teal", "#14b8a6"],
  ["green", "#22c55e"],
  ["olive", "#556b2f"],
  ["yellow", "#eab308"],
  ["gold", "#d4af37"],
  ["amber", "#f59e0b"],
  ["orange", "#f97316"],
  ["purple", "#a855f7"],
  ["pink", "#ec4899"],
  ["rose", "#f43f5e"],
  ["brown", "#78350f"],
  ["beige", "#d6c7a1"],
  ["cream", "#f5f0e1"],
  ["grey", "#6b7280"],
  ["gray", "#6b7280"],
  ["silver", "#c0c0c0"],
  ["slate", "#64748b"],
];

function expandHex(hex: string): string {
  const h = hex.trim().toLowerCase();
  return h.length === 4 ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h;
}

/** Colour for a name like "Black" / "Navy Blue", or null. */
export function hexForColorName(name: string | undefined | null): string | null {
  const lower = (name ?? "").toLowerCase();
  if (!lower) return null;
  // The colour word that comes FIRST in the name wins ("Navy Blue" -> navy, "Rose Gold" -> rose).
  let best: { at: number; hex: string } | null = null;
  for (const [word, hex] of NAMED_COLORS) {
    const m = new RegExp(`\\b${word}\\b`).exec(lower);
    if (m && (!best || m.index < best.at)) best = { at: m.index, hex };
  }
  return best?.hex ?? null;
}

/** Friendly name for a hex code: exact match on a known colour, else the nearest one when it's
 * clearly close, else the hex itself (uppercased) - never an invented name. */
export function nameForHex(hex: string): string {
  const target = expandHex(hex);
  const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r, g, b] = rgb(target);
  let best: { name: string; dist: number } | null = null;
  for (const [name, h] of NAMED_COLORS) {
    if (name === "gray") continue; // "grey" covers it
    const [r2, g2, b2] = rgb(h);
    const dist = Math.sqrt((r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2);
    if (!best || dist < best.dist) best = { name, dist };
  }
  if (best && best.dist <= 40) return best.name[0].toUpperCase() + best.name.slice(1);
  return target.toUpperCase();
}

/** A colour value as shown on the storefront. */
export function colorSwatch(value: string | { label: string; hex?: string }): { name: string; hex: string | null } {
  const label = (typeof value === "string" ? value : value.label ?? "").trim();
  const explicit = typeof value === "string" ? undefined : value.hex?.trim();
  if (explicit && isHexColor(explicit)) {
    return { name: isHexColor(label) || !label ? nameForHex(explicit) : label, hex: expandHex(explicit) };
  }
  if (isHexColor(label)) return { name: nameForHex(label), hex: expandHex(label) };
  return { name: label, hex: hexForColorName(label) };
}

/** Parses one admin-entered colour line: "Black|#000000", "Black #000000", "#000000" or "Black". */
export function parseColorLine(line: string): { label: string; hex?: string } {
  const trimmed = line.trim();
  const [rawLabel, rawHex] = trimmed.includes("|") ? trimmed.split("|").map((s) => s.trim()) : [trimmed, undefined];
  if (rawHex && isHexColor(rawHex)) return { label: rawLabel && !isHexColor(rawLabel) ? rawLabel : nameForHex(rawHex), hex: expandHex(rawHex) };
  const inline = rawLabel.match(/^(.*?)\s*(#(?:[0-9a-f]{6}|[0-9a-f]{3}))$/i);
  if (inline && inline[1]) return { label: inline[1].trim(), hex: expandHex(inline[2]) };
  if (isHexColor(rawLabel)) return { label: nameForHex(rawLabel), hex: expandHex(rawLabel) };
  return { label: rawLabel, hex: hexForColorName(rawLabel) ?? undefined };
}
