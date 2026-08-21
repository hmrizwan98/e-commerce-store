import React from "react";
import { getDraftThemeConfig } from "@/lib/theme/theme-repository";
import { getAllHomepageSectionsForAdmin } from "@/lib/firebase/repositories/homepage-sections";
import { getAllCategoriesForAdmin } from "@/lib/firebase/repositories/categories";
import { getAllBrandsForAdmin } from "@/lib/firebase/repositories/brands";
import { getAllPagesForAdmin } from "@/lib/firebase/repositories/pages";
import { getProducts, searchAdminProducts } from "@/lib/firebase/repositories/products";
import { getMenu } from "@/lib/firebase/repositories/menus";
import { getBlogPostsPageForAdmin } from "@/lib/firebase/repositories/blog-posts";
import { getAllTestimonialsForAdmin } from "@/lib/firebase/repositories/testimonials";
import CustomizeShell from "./CustomizeShell";

export const dynamic = "force-dynamic";

export default async function AdminCustomizePage() {
  const [
    draftTheme,
    homepageSections,
    categories,
    { products: featuredProductOptions },
    headerMenuItems,
    footerMenuItems,
    pages,
    brands,
    menuProducts,
    { posts: blogPosts },
    testimonials,
  ] = await Promise.all([
    getDraftThemeConfig(),
    getAllHomepageSectionsForAdmin(),
    getAllCategoriesForAdmin(),
    searchAdminProducts({ pageSize: 100 }),
    getMenu("header"),
    getMenu("footer"),
    getAllPagesForAdmin(),
    getAllBrandsForAdmin(),
    getProducts(200),
    getBlogPostsPageForAdmin({ limit: 100 }),
    getAllTestimonialsForAdmin(),
  ]);

  const cleanDraftTheme = JSON.parse(JSON.stringify(draftTheme));
  const cleanSections = JSON.parse(JSON.stringify(homepageSections));
  const cleanHeaderMenu = JSON.parse(JSON.stringify(headerMenuItems));
  const cleanFooterMenu = JSON.parse(JSON.stringify(footerMenuItems));

  return (
    <CustomizeShell
      initialDraft={cleanDraftTheme}
      homepage={{
        sections: cleanSections,
        categoryOptions: categories.map((c) => ({ id: c.id, name: c.name })),
        productOptions: featuredProductOptions.map((p) => ({ id: p.id, name: p.name })),
        blogOptions: blogPosts.map((b) => ({ id: b.id, name: b.title })),
        brandOptions: brands.filter((b) => !b.isDeleted).map((b) => ({ id: b.id, name: b.name })),
        testimonialOptions: testimonials.map((t) => ({ id: t.id, name: `${t.clientName} (${t.rating ?? 5}★) - "${t.content.substring(0, 30)}..."` })),
      }}
      navigation={{
        headerItems: cleanHeaderMenu,
        footerItems: cleanFooterMenu,
        options: {
          pages: pages.filter((p) => p.isActive).map((p) => ({ slug: p.slug, title: p.title })),
          categories: categories.filter((c) => !c.isDeleted).map((c) => ({ slug: c.slug, name: c.name })),
          brands: brands.filter((b) => !b.isDeleted).map((b) => ({ slug: b.slug, name: b.name })),
          products: menuProducts.map((p) => ({ slug: p.slug, name: p.name })),
        },
      }}
    />
  );
}
