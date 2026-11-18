import React from "react";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/firebase/repositories/pages";
import CmsPageContent from "@/components/cms/CmsPageContent";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await getPageBySlug(params.slug);
  if (!page) return {};
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
  };
}

export default async function CmsCustomPage({ params }: { params: { slug: string } }) {
  const page = await getPageBySlug(params.slug);
  if (!page) notFound();
  return <CmsPageContent page={page} />;
}
