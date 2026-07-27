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

export type HeroSlideFormInput = BannerFormInput;

export async function createHeroSlide(input: HeroSlideFormInput): Promise<string> {
  return createBanner("hero", input);
}

export async function updateHeroSlide(id: string, input: HeroSlideFormInput): Promise<void> {
  return updateBanner(id, input);
}

export async function deleteHeroSlide(id: string): Promise<void> {
  return deleteBanner(id);
}

export async function duplicateHeroSlide(id: string): Promise<string> {
  return duplicateBanner(id);
}

export async function setHeroSlideActive(id: string, isActive: boolean): Promise<void> {
  return setBannerActive(id, isActive);
}

export async function reorderHeroSlides(orderedIds: string[]): Promise<void> {
  return reorderBanners(orderedIds);
}
