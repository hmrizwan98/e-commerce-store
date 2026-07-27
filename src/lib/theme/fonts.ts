import {
  Poppins,
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
import type { FontKey } from "@/types/theme";

/**
 * Curated Google Font list loaded via next/font (self-hosted, no runtime
 * network request, no FOUT/CLS) - admins pick from this list rather than
 * typing an arbitrary font name, which would require a runtime <link> tag
 * and undermine the Lighthouse performance goal.
 */
export const poppins = Poppins({ subsets: ["latin"], display: "swap", weight: ["300", "400", "500", "600", "700"], variable: "--font-poppins" });
export const inter = Inter({ subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--font-inter" });
export const montserrat = Montserrat({ subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--font-montserrat" });
export const roboto = Roboto({ subsets: ["latin"], display: "swap", weight: ["400", "500", "700"], variable: "--font-roboto" });
export const openSans = Open_Sans({ subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--font-open-sans" });
export const lato = Lato({ subsets: ["latin"], display: "swap", weight: ["400", "700"], variable: "--font-lato" });
export const nunito = Nunito({ subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--font-nunito" });
export const playfairDisplay = Playfair_Display({ subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--font-playfair-display" });
export const raleway = Raleway({ subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--font-raleway" });
export const workSans = Work_Sans({ subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--font-work-sans" });

export const FONT_PRESETS: Record<FontKey, { label: string; className: string; variable: string }> = {
  poppins: { label: "Poppins", className: poppins.className, variable: poppins.variable },
  inter: { label: "Inter", className: inter.className, variable: inter.variable },
  montserrat: { label: "Montserrat", className: montserrat.className, variable: montserrat.variable },
  roboto: { label: "Roboto", className: roboto.className, variable: roboto.variable },
  openSans: { label: "Open Sans", className: openSans.className, variable: openSans.variable },
  lato: { label: "Lato", className: lato.className, variable: lato.variable },
  nunito: { label: "Nunito", className: nunito.className, variable: nunito.variable },
  playfairDisplay: { label: "Playfair Display", className: playfairDisplay.className, variable: playfairDisplay.variable },
  raleway: { label: "Raleway", className: raleway.className, variable: raleway.variable },
  workSans: { label: "Work Sans", className: workSans.className, variable: workSans.variable },
};

export const ALL_FONT_VARIABLES = Object.values(FONT_PRESETS)
  .map((f) => f.variable)
  .join(" ");

export const FONT_KEYS = Object.keys(FONT_PRESETS) as FontKey[];
