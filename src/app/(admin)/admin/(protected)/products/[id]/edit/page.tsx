import React from "react";
import { notFound } from "next/navigation";
import ProductForm from "../../ProductForm";
import { getProductById, getProductVariants, searchAdminProducts } from "@/lib/firebase/repositories/products";
import { getAllCategoriesForAdmin } from "@/lib/firebase/repositories/categories";
import { getAllBrandsForAdmin } from "@/lib/firebase/repositories/brands";
import { getAllSuppliersForAdmin } from "@/lib/firebase/repositories/suppliers";
import { getAllCollectionsForAdmin } from "@/lib/firebase/repositories/collections";
import { getRecentProductActivity } from "@/lib/firebase/repositories/product-activity-logs";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  if (!product) notFound();

  const [variants, categories, brands, suppliers, collections, activity, { products }] = await Promise.all([
    getProductVariants(product.id),
    getAllCategoriesForAdmin(),
    getAllBrandsForAdmin(),
    getAllSuppliersForAdmin(),
    getAllCollectionsForAdmin(),
    getRecentProductActivity(product.id),
    searchAdminProducts({ pageSize: 100 }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit product</h1>
      <ProductForm
        mode="edit"
        product={product}
        variants={variants}
        categories={categories}
        brands={brands}
        suppliers={suppliers}
        collections={collections}
        activity={activity}
        relatedOptions={products.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
