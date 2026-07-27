import React from "react";
import PageForm from "../PageForm";

export default function NewPagePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add page</h1>
      <PageForm mode="create" />
    </div>
  );
}
