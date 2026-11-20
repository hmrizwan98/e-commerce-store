import React from "react";
import Link from "next/link";
import ProductForm from "../ProductForm";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            title="Back to products list"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Add product</h1>
        </div>
        <Link
          href="/admin/products"
          className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          ← Back to products
        </Link>
      </div>
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
