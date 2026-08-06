import React from "react";
import SupplierForm from "../SupplierForm";

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add supplier</h1>
      <SupplierForm mode="create" />
    </div>
  );
}
