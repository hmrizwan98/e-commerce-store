import React from "react";
import { getMenu } from "@/lib/firebase/repositories/menus";
import { getAllPagesForAdmin } from "@/lib/firebase/repositories/pages";
import { getAllCategoriesForAdmin } from "@/lib/firebase/repositories/categories";
import { getAllBrandsForAdmin } from "@/lib/firebase/repositories/brands";
import { getProducts } from "@/lib/firebase/repositories/products";
import MenuEditor from "./MenuEditor";

export const dynamic = "force-dynamic";

export default async function AdminMenusPage() {
  const [header, footer, pages, categories, brands, products] = await Promise.all([
    getMenu("header"),
    getMenu("footer"),
    getAllPagesForAdmin(),
    getAllCategoriesForAdmin(),
    getAllBrandsForAdmin(),
    getProducts(200),
  ]);

  const options = {
    pages: pages.filter((p) => p.isActive).map((p) => ({ slug: p.slug, title: p.title })),
    categories: categories.filter((c) => !c.isDeleted).map((c) => ({ slug: c.slug, name: c.name })),
    brands: brands.filter((b) => !b.isDeleted).map((b) => ({ slug: b.slug, name: b.name })),
    products: products.map((p) => ({ slug: p.slug, name: p.name })),
  };

  return (
    <div className="space-y-8">
      {/* Executive Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
          <span>CONTENT</span>
          <span>/</span>
          <span className="text-indigo-600 dark:text-indigo-400">NAVIGATION MENUS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Store Navigation Menus
        </h1>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed pt-1">
          Customize header and footer navigation links. Pick link types to generate automatic URL paths for internal pages, categories, products, or brands. Drag and reorder items seamlessly.
        </p>
      </div>

      {/* Header Menu Section */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Header Main Navigation</h2>
            <p className="text-xs text-slate-400">Navigation links displayed at top of storefront</p>
          </div>
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60">
            {header.length} Top Items
          </span>
        </div>
        <MenuEditor menuId="header" initialItems={header} options={options} />
      </section>

      {/* Footer Menu Section */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Footer Links Navigation</h2>
            <p className="text-xs text-slate-400">Links displayed in the bottom footer of your store</p>
          </div>
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {footer.length} Footer Items
          </span>
        </div>
        <MenuEditor menuId="footer" initialItems={footer} options={options} />
      </section>
    </div>
  );
}
