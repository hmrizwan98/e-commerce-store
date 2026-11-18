import React from "react";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/firebase/repositories/pages";
import CmsPageContent from "@/components/cms/CmsPageContent";

export const dynamic = "force-dynamic";

/** The merchant's own About page: Store Admin → Pages, slug `about` (published). There is no
 * built-in About text - without that page this route is a 404 and the About menu links are
 * hidden (see filterNavForMissingPages). */
export async function generateMetadata() {
  const page = await getPageBySlug("about");
  if (!page) return { title: "Page not found" };
  return { title: page.seoTitle || page.title, description: page.seoDescription };
}

export default async function AboutPage() {
  const page = await getPageBySlug("about");
  if (!page) notFound();
  return <CmsPageContent page={page} />;
}
