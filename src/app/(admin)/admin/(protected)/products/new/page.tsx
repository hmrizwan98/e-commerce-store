import React from "react";
import ProductForm from "../ProductForm";
import { getAllCategoriesForAdmin } from "@/lib/firebase/repositories/categories";
import { getAllBrandsForAdmin } from "@/lib/firebase/repositories/brands";
import { getAllSuppliersForAdmin } from "@/lib/firebase/repositories/suppliers";
import { getAllCollectionsForAdmin } from "@/lib/firebase/repositories/collections";
import { searchAdminProducts } from "@/lib/firebase/repositories/products";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, brands, suppliers, collections, { products }] = await Promise.all([
    getAllCategoriesForAdmin(),
    getAllBrandsForAdmin(),
    getAllSuppliersForAdmin(),
    getAllCollectionsForAdmin(),
    searchAdminProducts({ pageSize: 100 }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add product</h1>
      <ProductForm
        mode="create"
        categories={categories}
        brands={brands}
        suppliers={suppliers}
        collections={collections}
        relatedOptions={products.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
