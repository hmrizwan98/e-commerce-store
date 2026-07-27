import React from "react";
import FaqForm from "../FaqForm";

export default function NewFaqPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add FAQ</h1>
      <FaqForm mode="create" />
    </div>
  );
}
