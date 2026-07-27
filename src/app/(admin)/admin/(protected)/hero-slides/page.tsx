import React from "react";
import Link from "next/link";
import { getAllBannersForAdmin } from "@/lib/firebase/repositories/banners";
import HeroSlidesList from "./HeroSlidesList";

export const dynamic = "force-dynamic";

export default async function AdminHeroSlidesPage() {
  const slides = await getAllBannersForAdmin("hero");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hero slides ({slides.length})</h1>
          <p className="text-sm text-neutral-500 mt-1">The rotating banners at the top of the homepage.</p>
        </div>
        <Link
          href={"/admin/hero-slides/new" as any}
          className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium"
        >
          + Add slide
        </Link>
      </div>

      <HeroSlidesList initialSlides={slides} />
    </div>
  );
}
