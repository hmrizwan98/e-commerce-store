/**
 * Generates a Tailwind-style 50-900 shade ramp from a single admin-picked hex
 * color (treated as the "600" anchor shade, since bg-primary-6000/secondary-6000
 * are the most heavily used shades in this codebase - see tailwind.config.js).
 * Lighter steps interpolate the anchor's lightness toward white, darker steps
 * toward black, preserving hue/saturation - the same idea most Tailwind-adjacent
 * theme generators use, not an attempt to reproduce Tailwind's exact palette math.
 */

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

const STEP_LIGHTNESS_FACTOR: Record<string, number> = {
  "50": 0.94,
  "100": 0.82,
  "200": 0.62,
  "300": 0.42,
  "400": 0.2,
  "500": 0.08,
  "600": 0,
  "700": -0.22,
  "800": -0.4,
  "900": -0.55,
};

export const SCALE_STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const;

/** Returns each step as an "r, g, b" triplet string, matching __theme_colors.scss's format. */
export function generateColorScale(anchorHex: string): Record<(typeof SCALE_STEPS)[number], string> {
  const [r, g, b] = hexToRgb(anchorHex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const scale = {} as Record<(typeof SCALE_STEPS)[number], string>;
  for (const step of SCALE_STEPS) {
    const factor = STEP_LIGHTNESS_FACTOR[step];
    const targetL = factor >= 0 ? l + (1 - l) * factor : l + l * factor;
    const clampedL = Math.min(1, Math.max(0, targetL));
    const [sr, sg, sb] = hslToRgb(h, s, clampedL);
    scale[step] = `${sr}, ${sg}, ${sb}`;
  }
  return scale;
}

export const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidHex(value: unknown): value is string {
  return typeof value === "string" && HEX_PATTERN.test(value);
}
