import React from "react";
import TestimonialForm from "../TestimonialForm";

export default function NewTestimonialPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add testimonial</h1>
      <TestimonialForm mode="create" />
    </div>
  );
}
