import type { FontKey } from "@/types/theme";

/** Every font the storefront can load (fonts.ts). Pure - safe for server code and tests. */
export const LOADABLE_FONT_KEYS: readonly FontKey[] = [
  "poppins",
  "inter",
  "montserrat",
  "roboto",
  "openSans",
  "lato",
  "nunito",
  "playfairDisplay",
  "raleway",
  "workSans",
];

export function isLoadableFontKey(value: unknown): value is FontKey {
  return typeof value === "string" && (LOADABLE_FONT_KEYS as readonly string[]).includes(value);
}
