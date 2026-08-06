import React from "react";
import { notFound } from "next/navigation";
import SupplierForm from "../../SupplierForm";
import { getSupplierById } from "@/lib/firebase/repositories/suppliers";

export const dynamic = "force-dynamic";

export default async function EditSupplierPage({ params }: { params: { id: string } }) {
  const supplier = await getSupplierById(params.id);
  if (!supplier) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit supplier</h1>
      <SupplierForm mode="edit" supplier={supplier} />
    </div>
  );
}
