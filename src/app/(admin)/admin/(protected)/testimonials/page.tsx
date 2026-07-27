import React from "react";
import Link from "next/link";
import { getAllTestimonialsForAdmin } from "@/lib/firebase/repositories/testimonials";
import TestimonialsList from "./TestimonialsList";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAllTestimonialsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Testimonials ({testimonials.length})</h1>
          <p className="text-sm text-neutral-500 mt-1">Customer reviews shown in the Testimonials section.</p>
        </div>
        <Link
          href={"/admin/testimonials/new" as any}
          className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium"
        >
          + Add testimonial
        </Link>
      </div>

      <TestimonialsList initialTestimonials={testimonials} />
    </div>
  );
}
