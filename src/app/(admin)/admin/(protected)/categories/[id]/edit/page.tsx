import React from "react";
import { notFound } from "next/navigation";
import CategoryForm from "../../CategoryForm";
import { getCategoryById, getAllCategoriesForAdmin } from "@/lib/firebase/repositories/categories";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const category = await getCategoryById(params.id);
  if (!category) notFound();
  const allCategories = await getAllCategoriesForAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit category</h1>
      <CategoryForm mode="edit" category={category} allCategories={allCategories} />
    </div>
  );
}
