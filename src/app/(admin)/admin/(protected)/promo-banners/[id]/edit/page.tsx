import React from "react";
import { notFound } from "next/navigation";
import BannerForm from "@/components/admin/BannerForm";
import { getBannerById } from "@/lib/firebase/repositories/banners";

export const dynamic = "force-dynamic";

export default async function EditPromoBannerPage({ params }: { params: { id: string } }) {
  const banner = await getBannerById(params.id);
  if (!banner) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit promo banner</h1>
      <BannerForm mode="edit" banner={banner} placement={banner.placement} />
    </div>
  );
}
