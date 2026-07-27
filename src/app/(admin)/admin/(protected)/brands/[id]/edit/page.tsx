import React from "react";
import { notFound } from "next/navigation";
import BrandForm from "../../BrandForm";
import { getBrandById } from "@/lib/firebase/repositories/brands";

export const dynamic = "force-dynamic";

export default async function EditBrandPage({ params }: { params: { id: string } }) {
  const brand = await getBrandById(params.id);
  if (!brand) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit brand</h1>
      <BrandForm mode="edit" brand={brand} />
    </div>
  );
}
