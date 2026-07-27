"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { reorderTestimonials, setTestimonialActive } from "./actions";
import TestimonialRowActions from "./TestimonialRowActions";
import type { Testimonial } from "@/types/testimonial";

const Stars: React.FC<{ rating?: number }> = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5 text-yellow-500 text-sm">
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={star <= rating ? "" : "text-neutral-300 dark:text-neutral-700"}>
        ★
      </span>
    ))}
  </div>
);

const TestimonialsList: React.FC<{ initialTestimonials: Testimonial[] }> = ({ initialTestimonials }) => {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [dragId, setDragId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const moveByIndex = async (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    const next = testimonials.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setTestimonials(next);
    try {
      await reorderTestimonials(next.map((t) => t.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reorder");
    }
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = testimonials.findIndex((t) => t.id === dragId);
    const to = testimonials.findIndex((t) => t.id === targetId);
    moveByIndex(from, to);
    setDragId(null);
  };

  const handleToggleActive = async (t: Testimonial) => {
    setTogglingId(t.id);
    setTestimonials((prev) => prev.map((x) => (x.id === t.id ? { ...x, isActive: !x.isActive } : x)));
    try {
      await setTestimonialActive(t.id, !t.isActive);
    } catch (err) {
      setTestimonials((prev) => prev.map((x) => (x.id === t.id ? { ...x, isActive: t.isActive } : x)));
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setTogglingId(null);
    }
  };

  if (!testimonials.length) {
    return (
      <div className="text-center py-12 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl">
        <p className="text-sm text-neutral-500">No testimonials yet.</p>
        <Link
          href={"/admin/testimonials/new" as any}
          className="inline-block mt-3 px-4 py-2 text-sm rounded-full bg-primary-6000 text-white font-medium"
        >
          + Add your first testimonial
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">Drag rows by the handle to reorder how they appear on the storefront.</p>
      {testimonials.map((t) => (
        <div
          key={t.id}
          draggable
          onDragStart={() => setDragId(t.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(t.id)}
          onDragEnd={() => setDragId(null)}
          className={`bg-white dark:bg-neutral-900 border rounded-2xl p-4 flex flex-wrap items-center gap-4 transition-opacity ${
            dragId === t.id ? "opacity-40" : "border-neutral-200 dark:border-neutral-800"
          }`}
        >
          <span className="cursor-grab text-neutral-400 select-none" title="Drag to reorder">
            ⠿
          </span>
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
            {t.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm font-semibold">
                {t.clientName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/admin/testimonials/${t.id}/edit` as any} className="font-semibold hover:underline">
                {t.clientName}
              </Link>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  t.isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                    : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                }`}
              >
                {t.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {[t.designation, t.company, t.country].filter(Boolean).join(" · ") || "—"}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-1 max-w-md">{t.content}</p>
          </div>
          <Stars rating={t.rating} />
          <label className="flex items-center gap-2 text-xs font-medium flex-shrink-0">
            <input
              type="checkbox"
              checked={t.isActive}
              disabled={togglingId === t.id}
              onChange={() => handleToggleActive(t)}
            />
            Active
          </label>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link href={`/admin/testimonials/${t.id}/edit` as any} className="text-sm font-medium hover:underline">
              Edit
            </Link>
            <TestimonialRowActions id={t.id} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestimonialsList;
