import type { ThemeHeader } from "@/types/theme";

/**
 * The store shows ONE announcement bar. The theme's own bar (Customizer -> Announcement Bar)
 * wins when it is switched on and has something to show; otherwise the bar managed in
 * Content -> Announcements (/admin/announcements) is shown, as before.
 */
export function isThemeTopBarActive(topBar: ThemeHeader["topBar"] | undefined): boolean {
  if (!topBar?.enabled) return false;
  return Boolean(topBar.text?.trim() || topBar.phone?.trim() || topBar.email?.trim() || topBar.showSocialIcons);
}

const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  copy: "©",
  reg: "®",
  trade: "™",
};

/**
 * Turns HTML entities someone pasted into announcement text (e.g. "Free&nbsp;shipping",
 * "Tom &amp; Jerry", "&#10022;") into the characters they stand for. The result is still
 * rendered as plain React text - never as HTML - so this can't inject markup.
 */
export function decodeHtmlEntities(text: string | undefined | null): string {
  if (!text) return "";
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match;
    }
    return NAMED[code.toLowerCase()] ?? match;
  });
}
