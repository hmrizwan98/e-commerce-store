import {
  Inter,
  Montserrat,
  Roboto,
  Open_Sans,
  Lato,
  Nunito,
  Playfair_Display,
  Raleway,
  Work_Sans,
} from "next/font/google";
import { poppins } from "./default-font";
import type { FontKey } from "@/types/theme";

export { poppins };

/**
 * Curated Google Font list loaded via next/font (self-hosted, no runtime
 * network request, no FOUT/CLS) - admins pick from this list rather than
 * typing an arbitrary font name, which would require a runtime <link> tag
 * and undermine the Lighthouse performance goal.
 */
export const inter = Inter({ subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--font-inter" });
export const montserrat = Montserrat({ subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--font-montserrat" });
export const roboto = Roboto({ subsets: ["latin"], display: "swap", weight: ["400", "500", "700"], variable: "--font-roboto" });
export const openSans = Open_Sans({ subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--font-open-sans" });
export const lato = Lato({ subsets: ["latin"], display: "swap", weight: ["400", "700"], variable: "--font-lato" });
export const nunito = Nunito({ subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--font-nunito" });
export const playfairDisplay = Playfair_Display({ subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--font-playfair-display" });
export const raleway = Raleway({ subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--font-raleway" });
export const workSans = Work_Sans({ subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--font-work-sans" });

/**
 * `variable` is next/font's generated CLASS name (e.g. "__variable_8b3a0b") - adding it to an
 * element defines the font's CSS custom property. `cssVar` is that custom property's NAME
 * (e.g. "--font-inter"), which is what `var(...)` must reference.
 */
export const FONT_PRESETS: Record<FontKey, { label: string; className: string; variable: string; cssVar: string }> = {
  poppins: { label: "Poppins", className: poppins.className, variable: poppins.variable, cssVar: "--font-poppins" },
  inter: { label: "Inter", className: inter.className, variable: inter.variable, cssVar: "--font-inter" },
  montserrat: { label: "Montserrat", className: montserrat.className, variable: montserrat.variable, cssVar: "--font-montserrat" },
  roboto: { label: "Roboto", className: roboto.className, variable: roboto.variable, cssVar: "--font-roboto" },
  openSans: { label: "Open Sans", className: openSans.className, variable: openSans.variable, cssVar: "--font-open-sans" },
  lato: { label: "Lato", className: lato.className, variable: lato.variable, cssVar: "--font-lato" },
  nunito: { label: "Nunito", className: nunito.className, variable: nunito.variable, cssVar: "--font-nunito" },
  playfairDisplay: { label: "Playfair Display", className: playfairDisplay.className, variable: playfairDisplay.variable, cssVar: "--font-playfair-display" },
  raleway: { label: "Raleway", className: raleway.className, variable: raleway.variable, cssVar: "--font-raleway" },
  workSans: { label: "Work Sans", className: workSans.className, variable: workSans.variable, cssVar: "--font-work-sans" },
};

export const ALL_FONT_VARIABLES = Object.values(FONT_PRESETS)
  .map((f) => f.variable)
  .join(" ");

export const FONT_KEYS = Object.keys(FONT_PRESETS) as FontKey[];
