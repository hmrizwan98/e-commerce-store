import React from "react";
import BannerForm from "@/components/admin/BannerForm";
import type { BannerPlacement } from "@/types/banner";

const VALID_PLACEMENTS: BannerPlacement[] = ["promo1", "promo2", "promo3"];

export default function NewPromoBannerPage({
  searchParams,
}: {
  searchParams: { placement?: string };
}) {
  const placement: BannerPlacement = VALID_PLACEMENTS.includes(searchParams.placement as BannerPlacement)
    ? (searchParams.placement as BannerPlacement)
    : "promo1";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add promo banner</h1>
      <BannerForm mode="create" placement={placement} />
    </div>
  );
}
