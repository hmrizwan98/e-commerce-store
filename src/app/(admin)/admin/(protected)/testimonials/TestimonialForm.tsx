"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";
import { createTestimonial, updateTestimonial, type TestimonialFormInput } from "./actions";
import type { Testimonial } from "@/types/testimonial";

const TestimonialForm: React.FC<{ mode: "create" | "edit"; testimonial?: Testimonial }> = ({
  mode,
  testimonial,
}) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientName, setClientName] = useState(testimonial?.clientName ?? "");
  const [content, setContent] = useState(testimonial?.content ?? "");
  const [rating, setRating] = useState(testimonial?.rating ?? 5);
  const [image, setImage] = useState<string[]>(testimonial?.image ? [testimonial.image] : []);
  const [designation, setDesignation] = useState(testimonial?.designation ?? "");
  const [company, setCompany] = useState(testimonial?.company ?? "");
  const [country, setCountry] = useState(testimonial?.country ?? "");
  const [order, setOrder] = useState(String(testimonial?.order ?? 0));
  const [isActive, setIsActive] = useState(testimonial?.isActive ?? true);
  const [imageUploading, setImageUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!clientName.trim() || !content.trim()) {
      setError("Client name and review text are required.");
      return;
    }
    const payload: TestimonialFormInput = {
      clientName: clientName.trim(),
      content: content.trim(),
      rating,
      image: image[0] || undefined,
      designation: designation.trim() || undefined,
      company: company.trim() || undefined,
      country: country.trim() || undefined,
      order: Number(order) || 0,
      isActive,
    };
    setSubmitting(true);
    try {
      if (mode === "create") {
        await createTestimonial(payload);
        toast.success("Testimonial created");
        router.push("/admin/testimonials");
      } else if (testimonial) {
        await updateTestimonial(testimonial.id, payload);
        toast.success("Changes saved");
        router.refresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
  const labelClass = "block text-sm font-medium mb-1";
  const cardClass =
    "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";
  const sectionTitleClass = "text-sm font-semibold text-neutral-500 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Customer</h2>
        <ImageUploader
          value={image}
          onChange={setImage}
          imageType="testimonial"
          multiple={false}
          label="Customer photo"
          onUploadingChange={setImageUploading}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Customer name</label>
            <input className={inputClass} value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <input className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Pakistan" />
          </div>
          <div>
            <label className={labelClass}>Designation</label>
            <input
              className={inputClass}
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Verified Buyer"
            />
          </div>
          <div>
            <label className={labelClass}>Company</label>
            <input className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Review</h2>
        <div>
          <label className={labelClass}>Review text</label>
          <textarea className={inputClass} rows={4} value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl leading-none ${star <= rating ? "text-yellow-500" : "text-neutral-300 dark:text-neutral-700"}`}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-neutral-500">{rating} / 5</span>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Display</h2>
        <div>
          <label className={labelClass}>Sort order</label>
          <input type="number" className={inputClass} value={order} onChange={(e) => setOrder(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Visible on storefront
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting || imageUploading}
        className="px-6 py-3 rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
      >
        {imageUploading ? "Uploading image…" : submitting ? "Saving…" : mode === "create" ? "Create testimonial" : "Save changes"}
      </button>
    </form>
  );
};

export default TestimonialForm;
