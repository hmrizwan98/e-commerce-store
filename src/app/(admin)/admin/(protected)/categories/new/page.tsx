import React from "react";
import CategoryForm from "../CategoryForm";
import { getAllCategoriesForAdmin } from "@/lib/firebase/repositories/categories";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const allCategories = await getAllCategoriesForAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add category</h1>
      <CategoryForm mode="create" allCategories={allCategories} />
    </div>
  );
}
