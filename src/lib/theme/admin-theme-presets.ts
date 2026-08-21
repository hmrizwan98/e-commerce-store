export interface AdminThemePreset {
  id: string;
  name: string;
  description: string;
  sidebarBg: string;
  sidebarText: string;
  headerGradient: string;
  accentColor: string;
  activeTextColor: string;
  activeBgColor: string;
  badgeBg: string;
  badgeText: string;
  logoGlow: string;
  fabBg: string;
}

export const ADMIN_THEME_PRESETS: Record<string, AdminThemePreset> = {
  indigo: {
    id: "indigo",
    name: "Indigo Royalty",
    description: "Sleek Dark Navy Sidebar with Indigo Sky Header & Curved Active Tab",
    sidebarBg: "bg-[#0b0f19]",
    sidebarText: "text-slate-400 hover:text-white",
    headerGradient: "bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-500 text-white shadow-sm",
    accentColor: "#6366f1",
    activeTextColor: "text-indigo-600 dark:text-indigo-400 font-extrabold",
    activeBgColor: "bg-[#f0f4fa] dark:bg-slate-950",
    badgeBg: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
    badgeText: "text-indigo-300",
    logoGlow: "from-indigo-500 to-cyan-400",
    fabBg: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/40",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Luxe",
    description: "Sleek Dark Charcoal Sidebar with Emerald Mint Header & Curved Active Tab",
    sidebarBg: "bg-[#08120e]",
    sidebarText: "text-slate-400 hover:text-white",
    headerGradient: "bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-sm",
    accentColor: "#10b981",
    activeTextColor: "text-emerald-600 dark:text-emerald-400 font-extrabold",
    activeBgColor: "bg-[#f0f4fa] dark:bg-slate-950",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    badgeText: "text-emerald-300",
    logoGlow: "from-emerald-400 to-teal-300",
    fabBg: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/40",
  },
  sunset: {
    id: "sunset",
    name: "Sunset Violet",
    description: "Sleek Dark Plum Sidebar with Purple Rose Header & Curved Active Tab",
    sidebarBg: "bg-[#11091b]",
    sidebarText: "text-slate-400 hover:text-white",
    headerGradient: "bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white shadow-sm",
    accentColor: "#ec4899",
    activeTextColor: "text-purple-600 dark:text-pink-400 font-extrabold",
    activeBgColor: "bg-[#f0f4fa] dark:bg-slate-950",
    badgeBg: "bg-pink-500/20 text-pink-300 border border-pink-500/30",
    badgeText: "text-pink-300",
    logoGlow: "from-purple-400 to-rose-400",
    fabBg: "bg-pink-600 hover:bg-pink-700 shadow-pink-600/40",
  },
  midnight: {
    id: "midnight",
    name: "Midnight Stealth",
    description: "Pitch Black Carbon Sidebar with Slate Cyan Header & Curved Active Tab",
    sidebarBg: "bg-[#080a0f]",
    sidebarText: "text-slate-400 hover:text-white",
    headerGradient: "bg-gradient-to-r from-slate-900 via-indigo-950 to-cyan-900 text-white shadow-sm",
    accentColor: "#06b6d4",
    activeTextColor: "text-cyan-600 dark:text-cyan-400 font-extrabold",
    activeBgColor: "bg-[#f0f4fa] dark:bg-slate-950",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
    badgeText: "text-cyan-300",
    logoGlow: "from-cyan-400 to-sky-400",
    fabBg: "bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/40",
  },
  ocean: {
    id: "ocean",
    name: "Oceanic Waves",
    description: "Sleek Sapphire Sidebar with Ocean Cyan Header & Curved Active Tab",
    sidebarBg: "bg-[#07111e]",
    sidebarText: "text-slate-400 hover:text-white",
    headerGradient: "bg-gradient-to-r from-blue-600 via-sky-500 to-teal-400 text-white shadow-sm",
    accentColor: "#0284c7",
    activeTextColor: "text-sky-600 dark:text-sky-400 font-extrabold",
    activeBgColor: "bg-[#f0f4fa] dark:bg-slate-950",
    badgeBg: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
    badgeText: "text-sky-300",
    logoGlow: "from-sky-400 to-teal-300",
    fabBg: "bg-sky-600 hover:bg-sky-700 shadow-sky-600/40",
  },
  amber: {
    id: "amber",
    name: "Golden Amber",
    description: "Sleek Dark Espresso Sidebar with Amber Gold Header & Curved Active Tab",
    sidebarBg: "bg-[#120d07]",
    sidebarText: "text-slate-400 hover:text-white",
    headerGradient: "bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500 text-white shadow-sm",
    accentColor: "#f59e0b",
    activeTextColor: "text-amber-600 dark:text-amber-400 font-extrabold",
    activeBgColor: "bg-[#f0f4fa] dark:bg-slate-950",
    badgeBg: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    badgeText: "text-amber-300",
    logoGlow: "from-amber-400 to-yellow-300",
    fabBg: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/40",
  },
};

export type AdminThemeKey = keyof typeof ADMIN_THEME_PRESETS;

export function getAdminThemePreset(key?: string): AdminThemePreset {
  if (key && ADMIN_THEME_PRESETS[key]) {
    return ADMIN_THEME_PRESETS[key];
  }
  return ADMIN_THEME_PRESETS.indigo;
}
