import React from "react";
import { notFound } from "next/navigation";
import HeroSlideForm from "../../HeroSlideForm";
import { getBannerById } from "@/lib/firebase/repositories/banners";

export const dynamic = "force-dynamic";

export default async function EditHeroSlidePage({ params }: { params: { id: string } }) {
  const slide = await getBannerById(params.id);
  if (!slide) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit hero slide</h1>
      <HeroSlideForm mode="edit" slide={slide} />
    </div>
  );
}
