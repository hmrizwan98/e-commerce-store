"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncementBar, updateAnnouncementBar, type AnnouncementBarFormInput } from "./actions";
import type { AnnouncementBar } from "@/types/announcement-bar";

function toDateInputValue(ms?: number | null): string {
  if (!ms) return "";
  return new Date(ms).toISOString().slice(0, 10);
}

function fromDateInputValue(value: string): number | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).getTime();
}

const AnnouncementForm: React.FC<{ mode: "create" | "edit"; bar?: AnnouncementBar }> = ({ mode, bar }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(bar?.title ?? "");
  const [subtitle, setSubtitle] = useState(bar?.subtitle ?? "");
  const [textColor, setTextColor] = useState(bar?.textColor ?? "#ffffff");
  const [backgroundColor, setBackgroundColor] = useState(bar?.backgroundColor ?? "#111827");
  const [buttonText, setButtonText] = useState(bar?.buttonText ?? "");
  const [buttonHref, setButtonHref] = useState(bar?.buttonHref ?? "");
  const [autoScroll, setAutoScroll] = useState(bar?.autoScroll ?? false);
  const [isClosable, setIsClosable] = useState(bar?.isClosable ?? true);
  const [showOnDesktop, setShowOnDesktop] = useState(bar?.showOnDesktop ?? true);
  const [showOnMobile, setShowOnMobile] = useState(bar?.showOnMobile ?? true);
  const [startDate, setStartDate] = useState(toDateInputValue(bar?.startDate));
  const [endDate, setEndDate] = useState(toDateInputValue(bar?.endDate));
  const [priority, setPriority] = useState(String(bar?.priority ?? 0));
  const [isActive, setIsActive] = useState(bar?.isActive ?? true);
  const [order, setOrder] = useState(String(bar?.order ?? 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    const payload: AnnouncementBarFormInput = {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      textColor,
      backgroundColor,
      buttonText: buttonText.trim() || undefined,
      buttonHref: buttonHref.trim() || undefined,
      autoScroll,
      isClosable,
      showOnDesktop,
      showOnMobile,
      startDate: fromDateInputValue(startDate),
      endDate: fromDateInputValue(endDate),
      priority: Number(priority) || 0,
      isActive,
      order: Number(order) || 0,
    };
    setSubmitting(true);
    try {
      if (mode === "create") {
        await createAnnouncementBar(payload);
        router.push("/admin/announcements");
      } else if (bar) {
        await updateAnnouncementBar(bar.id, payload);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
  const labelClass = "block text-sm font-medium mb-1";
  const cardClass =
    "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}

      <div className={cardClass}>
        <h2 className="font-semibold">Content</h2>
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Subtitle (optional)</label>
          <input className={inputClass} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Button text (optional)</label>
            <input className={inputClass} value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Button link</label>
            <input
              placeholder="/collection"
              className={inputClass}
              value={buttonHref}
              onChange={(e) => setButtonHref(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold">Appearance</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Text color</label>
            <input type="color" className="h-10 w-full rounded-lg border border-neutral-300 dark:border-neutral-700" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Background color</label>
            <input type="color" className="h-10 w-full rounded-lg border border-neutral-300 dark:border-neutral-700" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
          </div>
        </div>
        <div
          className="rounded-lg px-4 py-2 text-sm text-center"
          style={{ color: textColor, backgroundColor }}
        >
          {title || "Announcement preview"} {subtitle && `— ${subtitle}`}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} />
          Auto-scroll the text (marquee)
        </label>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold">Visibility</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showOnDesktop} onChange={(e) => setShowOnDesktop(e.target.checked)} />
            Show on desktop
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showOnMobile} onChange={(e) => setShowOnMobile(e.target.checked)} />
            Show on mobile
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isClosable} onChange={(e) => setIsClosable(e.target.checked)} />
            Customers can dismiss it
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Start date (optional)</label>
            <input type="date" className={inputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>End date (optional)</label>
            <input type="date" className={inputClass} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Priority (higher wins if multiple are active)</label>
            <input type="number" className={inputClass} value={priority} onChange={(e) => setPriority(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Sort order</label>
            <input type="number" className={inputClass} value={order} onChange={(e) => setOrder(e.target.value)} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
      >
        {submitting ? "Saving…" : mode === "create" ? "Create announcement bar" : "Save changes"}
      </button>
    </form>
  );
};

export default AnnouncementForm;
