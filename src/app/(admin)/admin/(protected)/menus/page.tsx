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
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Menus</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Header items with a &quot;Mega menu&quot; type render their children as grouped columns; &quot;Dropdown&quot; renders a
          simple list. Pick a &quot;Link Type&quot; to link straight to a page/product/category/brand - the URL is
          generated for you. Reorder with the arrow buttons - only items you see here appear on the storefront.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Header menu</h2>
        <MenuEditor menuId="header" initialItems={header} options={options} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Footer menu</h2>
        <MenuEditor menuId="footer" initialItems={footer} options={options} />
      </section>
    </div>
  );
}
