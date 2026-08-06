import React from "react";
import StoreCreationWizard from "../StoreCreationWizard";

export default function NewStorePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Create store</h1>
      <StoreCreationWizard />
    </div>
  );
}
