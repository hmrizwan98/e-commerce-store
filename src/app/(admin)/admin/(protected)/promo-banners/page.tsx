import React from "react";
import Link from "next/link";
import { getAllBannersForAdmin } from "@/lib/firebase/repositories/banners";
import PromoBannersList from "./PromoBannersList";
import type { BannerPlacement } from "@/types/banner";

export const dynamic = "force-dynamic";

const PLACEMENT_TABS: { placement: BannerPlacement; label: string }[] = [
  { placement: "promo1", label: "Promo Banner 1" },
  { placement: "promo2", label: "Promo Banner 2" },
  { placement: "promo3", label: "Promo Banner 3" },
];

export default async function AdminPromoBannersPage({
  searchParams,
}: {
  searchParams: { placement?: string };
}) {
  const activePlacement: BannerPlacement = PLACEMENT_TABS.some((t) => t.placement === searchParams.placement)
    ? (searchParams.placement as BannerPlacement)
    : "promo1";

  const banners = await getAllBannersForAdmin(activePlacement);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Promo banners ({banners.length})</h1>
          <p className="text-sm text-neutral-500 mt-1">The 3 promotional sections on the homepage.</p>
        </div>
        <Link
          href={`/admin/promo-banners/new?placement=${activePlacement}` as any}
          className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium"
        >
          + Add banner
        </Link>
      </div>

      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
        {PLACEMENT_TABS.map((tab) => (
          <Link
            key={tab.placement}
            href={`/admin/promo-banners?placement=${tab.placement}` as any}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activePlacement === tab.placement
                ? "border-primary-6000 text-primary-6000"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <PromoBannersList initialBanners={banners} placement={activePlacement} />
    </div>
  );
}
