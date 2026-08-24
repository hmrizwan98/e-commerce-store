"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Input from "@/shared/Input/Input";
import ImageUploader from "@/components/admin/ImageUploader";
import { saveThemeDraftAction, publishThemeAction, resetThemeDraftAction } from "../actions";
import type { SystemThemeConfig, PopupThemeConfig } from "@/lib/theme/theme-types";

export interface PopupsBuilderClientProps {
  draftTheme: SystemThemeConfig;
  activeTheme: SystemThemeConfig;
}

export default function PopupsBuilderClient({ draftTheme, activeTheme }: PopupsBuilderClientProps) {
  const initialPopup: PopupThemeConfig = draftTheme.popup ?? {
    enabled: false,
    title: "Exclusive Store Discount",
    description: "Subscribe to our VIP newsletter to unlock 15% off your first purchase!",
    buttonText: "Claim Discount",
    buttonUrl: "/signup",
    trigger: "page-load",
    delaySeconds: 3,
    frequency: "once-per-session",
    styleVariant: "center-modal",
  };

  const [popup, setPopup] = useState<PopupThemeConfig>(initialPopup);
  const [loading, setLoading] = useState(false);

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const updatedConfig: Partial<SystemThemeConfig> = {
        ...draftTheme,
        popup,
      };
      const res = await saveThemeDraftAction(updatedConfig);
      if (res?.ok) {
        toast.success("Saved draft popup configuration!");
      } else {
        toast.error(res?.message || "Failed to save draft.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save draft.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      const updatedConfig: Partial<SystemThemeConfig> = {
        ...draftTheme,
        popup,
      };
      const draftRes = await saveThemeDraftAction(updatedConfig);
      if (draftRes?.ok) {
        const pubRes = await publishThemeAction();
        if (pubRes?.ok) {
          toast.success("Published popup settings live to storefront!");
        } else {
          toast.error(pubRes?.message || "Failed to publish popup.");
        }
      } else {
        toast.error(draftRes?.message || "Failed to save draft.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to publish popup.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await resetThemeDraftAction();
      if (res?.ok) {
        toast.success("Reset draft to active published popup settings!");
        setPopup(activeTheme.popup ?? initialPopup);
      } else {
        toast.error(res?.message || "Failed to reset draft.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to reset draft.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Draft Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-900/5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-slate-500 dark:text-slate-400">Draft Status:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Working Draft
          </span>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <ButtonSecondary onClick={handleReset} disabled={loading} className="!rounded-full text-xs">
            Reset Draft
          </ButtonSecondary>
          <ButtonSecondary onClick={handleSaveDraft} loading={loading} className="!rounded-full text-xs">
            Save Draft
          </ButtonSecondary>
          <ButtonPrimary onClick={handlePublish} loading={loading} className="!rounded-full text-xs shadow-md shadow-primary-500/20">
            Publish Live
          </ButtonPrimary>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Configuration Controls */}
        <div className="lg:col-span-7 p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-900/5 space-y-6">
          {/* Toggle Enable/Disable Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-200/80 dark:border-slate-800/80">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Enable Storefront Popup</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Toggle whether popups are displayed to storefront visitors.</p>
            </div>
            <button
              type="button"
              onClick={() => setPopup((prev) => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                popup.enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  popup.enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Popup Title
              </label>
              <Input
                value={popup.title || ""}
                onChange={(e) => setPopup((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Welcome to our store"
                className="!rounded-2xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Button Text
              </label>
              <Input
                value={popup.buttonText || ""}
                onChange={(e) => setPopup((prev) => ({ ...prev, buttonText: e.target.value }))}
                placeholder="e.g. Get 10% Off"
                className="!rounded-2xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Description
            </label>
            <textarea
              value={popup.description || ""}
              onChange={(e) => setPopup((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              placeholder="Subscribe to our newsletter for exclusive discounts and new product updates..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Button Target URL
            </label>
            <Input
              value={popup.buttonUrl || ""}
              onChange={(e) => setPopup((prev) => ({ ...prev, buttonUrl: e.target.value }))}
              placeholder="e.g. /category/sale or https://example.com"
              className="!rounded-2xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Trigger Event
              </label>
              <select
                value={popup.trigger || "page-load"}
                onChange={(e) => setPopup((prev) => ({ ...prev, trigger: e.target.value as any }))}
                className="w-full px-3 py-2 text-xs font-medium rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="page-load">Page Load</option>
                <option value="delay">Time Delay</option>
                <option value="exit-intent">Exit Intent (Desktop)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Delay (Seconds)
              </label>
              <Input
                type="number"
                min={0}
                max={60}
                value={popup.delaySeconds ?? 3}
                onChange={(e) => setPopup((prev) => ({ ...prev, delaySeconds: parseInt(e.target.value, 10) || 0 }))}
                className="!rounded-2xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Frequency Limit
              </label>
              <select
                value={popup.frequency || "once-per-session"}
                onChange={(e) => setPopup((prev) => ({ ...prev, frequency: e.target.value as any }))}
                className="w-full px-3 py-2 text-xs font-medium rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="once-per-session">Once Per Session</option>
                <option value="once-per-day">Once Per Day</option>
                <option value="always">Always (Every Page)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Image Banner (Optional)
            </label>
            <ImageUploader
              value={popup.imageUrl ? [popup.imageUrl] : []}
              onChange={(urls) => setPopup((prev) => ({ ...prev, imageUrl: urls[0] || "" }))}
              imageType="banner"
              multiple={false}
            />
          </div>
        </div>

        {/* Right Column: Live Interactive Storefront Preview Card */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Real-Time Storefront Preview
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                popup.enabled
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60"
              }`}
            >
              {popup.enabled ? "● Active" : "○ Disabled"}
            </span>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 min-h-[420px] flex items-center justify-center">
            {/* Background Storefront Simulation Wallpaper */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Simulated Storefront Page Backdrop */}
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm pointer-events-none" />

            {/* Simulated Live Modal Popup Container */}
            <div className={`relative z-10 w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden transition-all duration-300 ${
              popup.enabled ? "scale-100 opacity-100" : "scale-95 opacity-50 grayscale"
            }`}>
              {/* Top Banner Image (If present) */}
              {popup.imageUrl ? (
                <div className="relative h-40 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={popup.imageUrl} alt="Popup Banner" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-900/60 text-white flex items-center justify-center text-xs backdrop-blur-md"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex justify-end p-3">
                  <button
                    type="button"
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Popup Content */}
              <div className="p-6 text-center space-y-3">
                <div className="text-3xl">🎁</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {popup.title || "Welcome to our store"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {popup.description || "Subscribe to our newsletter for exclusive discounts and new product updates."}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center justify-center w-full px-5 py-3 rounded-full bg-primary-6000 text-white text-xs font-bold shadow-lg shadow-primary-500/25">
                    {popup.buttonText || "Get 10% Off"}
                  </span>
                </div>
                {popup.buttonUrl && (
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate pt-1">
                    Target: {popup.buttonUrl}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
