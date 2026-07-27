import React from "react";
import { notFound } from "next/navigation";
import TestimonialForm from "../../TestimonialForm";
import { getTestimonialById } from "@/lib/firebase/repositories/testimonials";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({ params }: { params: { id: string } }) {
  const testimonial = await getTestimonialById(params.id);
  if (!testimonial) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit testimonial</h1>
      <TestimonialForm mode="edit" testimonial={testimonial} />
    </div>
  );
}
