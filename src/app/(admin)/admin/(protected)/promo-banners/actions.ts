"use server";

import {
  createBanner,
  updateBanner,
  deleteBanner,
  duplicateBanner,
  setBannerActive,
  reorderBanners,
  type BannerFormInput,
} from "@/lib/firebase/banner-actions";
import type { BannerPlacement } from "@/types/banner";

export type PromoBannerFormInput = BannerFormInput;

export async function createPromoBanner(placement: BannerPlacement, input: PromoBannerFormInput): Promise<string> {
  return createBanner(placement, input);
}

export async function updatePromoBanner(id: string, input: PromoBannerFormInput): Promise<void> {
  return updateBanner(id, input);
}

export async function deletePromoBanner(id: string): Promise<void> {
  return deleteBanner(id);
}

export async function duplicatePromoBanner(id: string): Promise<string> {
  return duplicateBanner(id);
}

export async function setPromoBannerActive(id: string, isActive: boolean): Promise<void> {
  return setBannerActive(id, isActive);
}

export async function reorderPromoBanners(orderedIds: string[]): Promise<void> {
  return reorderBanners(orderedIds);
}
