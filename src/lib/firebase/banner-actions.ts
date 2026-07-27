"use server";

import { revalidatePath } from "next/cache";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import { getBannerById } from "@/lib/firebase/repositories/banners";
import { deleteImagesByUrls, diffRemovedImages } from "@/lib/images/cleanup";
import type { BannerAnimation, BannerBackgroundPosition, BannerPlacement, BannerTextAlign } from "@/types/banner";

export interface BannerFormInput {
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaText2?: string;
  ctaHref2?: string;
  badgeText?: string;
  offerText?: string;
  discountText?: string;
  imageDesktop: string;
  imageMobile?: string;
  textAlign?: BannerTextAlign;
  textColor?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  backgroundPosition?: BannerBackgroundPosition;
  animation?: BannerAnimation;
  order: number;
  isActive: boolean;
}

const ADMIN_PATH_BY_PLACEMENT: Record<BannerPlacement, string> = {
  hero: "/admin/hero-slides",
  promo1: "/admin/promo-banners",
  promo2: "/admin/promo-banners",
  promo3: "/admin/promo-banners",
  "homepage-generic": "/admin/promo-banners",
};

function revalidateStorefront(placement: BannerPlacement) {
  revalidatePath(ADMIN_PATH_BY_PLACEMENT[placement]);
  revalidatePath("/", "layout");
}

export async function createBanner(placement: BannerPlacement, input: BannerFormInput): Promise<string> {
  await requireAdmin();
  const ref = adminDb().collection("banners").doc();
  await ref.set({
    ...stripUndefined(input),
    placement,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  revalidateStorefront(placement);
  return ref.id;
}

export async function updateBanner(id: string, input: BannerFormInput): Promise<void> {
  await requireAdmin();
  const before = await getBannerById(id);

  await adminDb().collection("banners").doc(id).update({ ...stripUndefined(input), updatedAt: serverTimestamp() });
  revalidateStorefront(before?.placement ?? "hero");

  await deleteImagesByUrls(
    diffRemovedImages(
      [before?.imageDesktop, before?.imageMobile],
      [input.imageDesktop, input.imageMobile]
    )
  );
}

export async function deleteBanner(id: string): Promise<void> {
  await requireAdmin();
  const banner = await getBannerById(id);
  await adminDb().collection("banners").doc(id).delete();
  revalidateStorefront(banner?.placement ?? "hero");
  await deleteImagesByUrls([banner?.imageDesktop, banner?.imageMobile]);
}

export async function duplicateBanner(id: string): Promise<string> {
  await requireAdmin();
  const banner = await getBannerById(id);
  if (!banner) throw new Error("Banner not found");
  const ref = adminDb().collection("banners").doc();
  await ref.set({
    ...stripUndefined({
      title: `${banner.title} (copy)`,
      subtitle: banner.subtitle,
      description: banner.description,
      ctaText: banner.ctaText,
      ctaHref: banner.ctaHref,
      ctaText2: banner.ctaText2,
      ctaHref2: banner.ctaHref2,
      badgeText: banner.badgeText,
      offerText: banner.offerText,
      discountText: banner.discountText,
      imageDesktop: banner.imageDesktop,
      imageMobile: banner.imageMobile,
      textAlign: banner.textAlign,
      textColor: banner.textColor,
      overlayColor: banner.overlayColor,
      overlayOpacity: banner.overlayOpacity,
      backgroundPosition: banner.backgroundPosition,
      animation: banner.animation,
      order: banner.order + 1,
      isActive: false,
    }),
    placement: banner.placement,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  revalidateStorefront(banner.placement);
  return ref.id;
}

export async function setBannerActive(id: string, isActive: boolean): Promise<void> {
  await requireAdmin();
  const banner = await getBannerById(id);
  await adminDb().collection("banners").doc(id).update({ isActive, updatedAt: serverTimestamp() });
  revalidateStorefront(banner?.placement ?? "hero");
}

export async function reorderBanners(orderedIds: string[]): Promise<void> {
  await requireAdmin();
  const batch = adminDb().batch();
  orderedIds.forEach((id, index) => {
    batch.update(adminDb().collection("banners").doc(id), { order: index, updatedAt: serverTimestamp() });
  });
  await batch.commit();
  revalidatePath("/admin/hero-slides");
  revalidatePath("/admin/promo-banners");
  revalidatePath("/", "layout");
}
