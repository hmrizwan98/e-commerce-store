import React from "react";
import BrandForm from "../BrandForm";

export default function NewBrandPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add brand</h1>
      <BrandForm mode="create" />
    </div>
  );
}
