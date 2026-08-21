import React from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";
import type { ThemeLogos } from "@/types/theme";

export interface HeaderInspectorProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function HeaderInspector({ draft, onChange }: HeaderInspectorProps) {
  const header = draft.header ?? {};
  const logos = draft.logos ?? {};

  const updateHeader = (patch: Partial<NonNullable<SystemThemeConfig["header"]>>) => {
    onChange({ header: { ...header, ...patch } });
  };

  const updateLogos = (patch: Partial<ThemeLogos>) => {
    onChange({ logos: { ...logos, ...patch } });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Header & Navigation Inspector
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize navigation layout, store logo image, header height, sticky behavior, search and action icons.
        </p>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Store Logo & Branding
          </h4>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
            Dynamic Per Store
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload your official store logo image. If no image logo is uploaded, your Store Name will render dynamically.
        </p>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Main Brand Logo (Light Mode)
          </label>
          <ImageUploader
            imageType="themeLogo"
            value={logos.logoLight ? [logos.logoLight] : []}
            onChange={(urls) => updateLogos({ logoLight: urls[0] ?? "" })}
            multiple={false}
          />
        </div>

        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Dark Mode Logo (Optional)
          </label>
          <ImageUploader
            imageType="themeLogo"
            value={logos.logoDark ? [logos.logoDark] : []}
            onChange={(urls) => updateLogos({ logoDark: urls[0] ?? "" })}
            multiple={false}
          />
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Logo Display Height ({header.logoHeightPx ?? 40}px)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={24}
              max={100}
              step={2}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
              value={header.logoHeightPx ?? 40}
              onChange={(e) => updateHeader({ logoHeightPx: Number(e.target.value) })}
            />
            <input
              type="number"
              min={24}
              max={100}
              className="w-16 px-2 py-1 text-xs text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              value={header.logoHeightPx ?? 40}
              onChange={(e) => updateHeader({ logoHeightPx: Number(e.target.value) || 40 })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Header Layout Style
          </label>
          <select
            className={inputClass}
            value={header.variant ?? "centered"}
            onChange={(e) => updateHeader({ variant: e.target.value as "centered" | "mega-menu" | "transparent-overlay" })}
          >
            <option value="centered">Centered Brand Logo & Navigation</option>
            <option value="mega-menu">Mega-Menu Navigation Header</option>
            <option value="transparent-overlay">Transparent Hero Overlay Header</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Logo Alignment
          </label>
          <select
            className={inputClass}
            value={header.logoAlignment ?? "left"}
            onChange={(e) => updateHeader({ logoAlignment: e.target.value as "left" | "center" })}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Header Height ({header.heightPx ?? 80}px)
          </label>
          <input
            type="number"
            className={inputClass}
            value={header.heightPx ?? 80}
            onChange={(e) => updateHeader({ heightPx: Number(e.target.value) || 80 })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Header Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
              value={draft.colors?.headerBackground ?? "#ffffff"}
              onChange={(e) =>
                onChange({
                  colors: { ...draft.colors, headerBackground: e.target.value },
                })
              }
            />
            <input
              type="text"
              className={inputClass}
              value={draft.colors?.headerBackground ?? "#ffffff"}
              onChange={(e) =>
                onChange({
                  colors: { ...draft.colors, headerBackground: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Header Shadow
          </label>
          <select
            className={inputClass}
            value={header.shadow ?? "none"}
            onChange={(e) => updateHeader({ shadow: e.target.value as any })}
          >
            <option value="none">None</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra Large</option>
          </select>
        </div>

        <div className="space-y-2 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={header.sticky ?? true}
              onChange={(e) => updateHeader({ sticky: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Sticky Header on Scroll
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={header.showSearch ?? true}
              onChange={(e) => updateHeader({ showSearch: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Show Search Bar / Icon
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={header.showAccount ?? true}
              onChange={(e) => updateHeader({ showAccount: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Show User Account Icon
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={header.showCart ?? true}
              onChange={(e) => updateHeader({ showCart: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Show Shopping Cart Icon
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
