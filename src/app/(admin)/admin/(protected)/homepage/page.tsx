import React from "react";
import { getAllHomepageSectionsForAdmin } from "@/lib/firebase/repositories/homepage-sections";
import { getAllCategoriesForAdmin } from "@/lib/firebase/repositories/categories";
import { searchAdminProducts } from "@/lib/firebase/repositories/products";
import HomepageSections from "./HomepageSections";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const [sections, categories, { products }] = await Promise.all([
    getAllHomepageSectionsForAdmin(),
    getAllCategoriesForAdmin(),
    searchAdminProducts({ pageSize: 100 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Homepage builder</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Drag to reorder, toggle sections on or off, and edit their content. Changes go live on the storefront
          as soon as you save.
        </p>
      </div>
      <HomepageSections
        sections={sections}
        categoryOptions={categories.map((c) => ({ id: c.id, name: c.name }))}
        productOptions={products.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
