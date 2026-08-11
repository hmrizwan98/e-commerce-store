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
    const updatedConfig: Partial<SystemThemeConfig> = {
      ...draftTheme,
      popup,
    };
    const res = await saveThemeDraftAction(updatedConfig);
    if (res.ok) {
      toast.success("Saved draft popup configuration!");
    } else {
      toast.error("Failed to save draft.");
    }
    setLoading(false);
  };

  const handlePublish = async () => {
    setLoading(true);
    const updatedConfig: Partial<SystemThemeConfig> = {
      ...draftTheme,
      popup,
    };
    await saveThemeDraftAction(updatedConfig);
    const pubRes = await publishThemeAction();
    if (pubRes.ok) {
      toast.success("Published popup settings live to storefront!");
    } else {
      toast.error("Failed to publish popup.");
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setLoading(true);
    const res = await resetThemeDraftAction();
    if (res.ok) {
      toast.success("Reset draft to active published popup settings!");
      setPopup(activeTheme.popup ?? initialPopup);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <div className="text-sm font-medium">
          Draft Status: <span className="text-amber-600 font-bold">Working Draft</span>
        </div>
        <div className="flex items-center gap-3">
          <ButtonSecondary onClick={handleReset} disabled={loading}>
            Reset Draft
          </ButtonSecondary>
          <ButtonSecondary onClick={handleSaveDraft} loading={loading}>
            Save Draft
          </ButtonSecondary>
          <ButtonPrimary onClick={handlePublish} loading={loading}>
            Publish Live
          </ButtonPrimary>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6">
        <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-lg">Enable Storefront Popup</h3>
            <p className="text-xs text-slate-500">Toggle whether popups are displayed to storefront visitors.</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
            <input
              type="checkbox"
              checked={popup.enabled ?? false}
              onChange={(e) => setPopup((prev) => ({ ...prev, enabled: e.target.checked }))}
              className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
            />
            {popup.enabled ? "Enabled" : "Disabled"}
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Popup Title
            </label>
            <Input
              value={popup.title || ""}
              onChange={(e) => setPopup((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. 15% Off Your First Order"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Button Text
            </label>
            <Input
              value={popup.buttonText || ""}
              onChange={(e) => setPopup((prev) => ({ ...prev, buttonText: e.target.value }))}
              placeholder="e.g. Claim Discount"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Description
          </label>
          <textarea
            value={popup.description || ""}
            onChange={(e) => setPopup((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            placeholder="Enter popup message or promotional copy..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Button Target URL
          </label>
          <Input
            value={popup.buttonUrl || ""}
            onChange={(e) => setPopup((prev) => ({ ...prev, buttonUrl: e.target.value }))}
            placeholder="e.g. /category/sale or https://example.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Trigger Event
            </label>
            <select
              value={popup.trigger || "page-load"}
              onChange={(e) => setPopup((prev) => ({ ...prev, trigger: e.target.value as any }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            >
              <option value="page-load">Page Load</option>
              <option value="delay">Time Delay</option>
              <option value="exit-intent">Exit Intent (Desktop)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Delay (Seconds)
            </label>
            <Input
              type="number"
              min={0}
              max={60}
              value={popup.delaySeconds ?? 3}
              onChange={(e) => setPopup((prev) => ({ ...prev, delaySeconds: parseInt(e.target.value, 10) || 0 }))}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Frequency Limit
            </label>
            <select
              value={popup.frequency || "once-per-session"}
              onChange={(e) => setPopup((prev) => ({ ...prev, frequency: e.target.value as any }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            >
              <option value="once-per-session">Once Per Session</option>
              <option value="once-per-day">Once Per Day</option>
              <option value="always">Always (Every Page)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
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
    </div>
  );
}
