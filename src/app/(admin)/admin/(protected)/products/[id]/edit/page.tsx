import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            title="Back to products list"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Edit product</h1>
        </div>
        <Link
          href="/admin/products"
          className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          ← Back to products
        </Link>
      </div>
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
