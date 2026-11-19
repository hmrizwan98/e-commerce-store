import React, { FC } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import type { Banner } from "@/types/banner";
import type { Route } from "@/routers/types";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { getObjectPositionClass } from "@/lib/banners/position";

export interface SectionPromo1Props {
  className?: string;
  banner?: Banner;
}

const SectionPromo1: FC<SectionPromo1Props> = ({ className = "", banner }) => {
  // Store Admin → Promo Banners only (no demo heading, copy or illustration).
  const heading = banner?.title;
  const subHeading = banner?.description || banner?.subtitle;
  const ctaText = banner?.ctaText || "Shop now";
  const ctaHref = banner?.ctaHref || "/collection";
  const ctaText2 = banner?.ctaText2;
  const ctaHref2 = banner?.ctaHref2;
  const badgeText = banner?.badgeText;

  const bannerImg = (banner as any)?.imageDesktop || (banner as any)?.image ? safeImageSrc((banner as any).imageDesktop || (banner as any).image) : null;
  const mobileImg = (banner as any)?.imageMobile ? safeImageSrc((banner as any).imageMobile) : null;
  const bgPosClass = getObjectPositionClass((banner as any)?.backgroundPosition);
  if (!heading && !bannerImg) return null;

  return (
    <div
      className={`nc-SectionPromo1 relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 my-8 ${className}`}
    >
      <div className="w-full lg:w-1/2 space-y-4">
        {badgeText && (
          <span className="text-xs font-bold tracking-widest text-sky-600 dark:text-sky-400 uppercase block">
            {badgeText}
          </span>
        )}
        {heading && (
          <h2 className="font-bold text-3xl sm:text-4xl xl:text-5xl !leading-[1.2] tracking-tight text-slate-900 dark:text-white">
            {heading}
          </h2>
        )}
        {subHeading && (
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {subHeading}
          </p>
        )}
        <div className="flex items-center space-x-3 sm:space-x-4 pt-4">
          <ButtonPrimary href={ctaHref as Route}>
            {ctaText}
          </ButtonPrimary>
          {ctaText2 && ctaHref2 && (
            <ButtonSecondary
              href={ctaHref2 as Route}
              className="border border-slate-200 dark:border-slate-700"
            >
              {ctaText2}
            </ButtonSecondary>
          )}
        </div>
      </div>

      {bannerImg && (
        <div className="w-full lg:w-1/2 relative rounded-3xl overflow-hidden shadow-sm">
          <picture className="block w-full">
            {mobileImg && (
              <source media="(max-width: 767px)" srcSet={mobileImg} />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerImg}
              alt={banner?.title || "Promotion"}
              className={`w-full max-h-[460px] object-cover rounded-3xl shadow-md ${bgPosClass}`}
            />
          </picture>
          {banner?.overlayColor && (banner.overlayOpacity ?? 0) > 0 && (
            <div
              className="absolute inset-0 z-[1] pointer-events-none"
              style={{ backgroundColor: banner.overlayColor, opacity: banner.overlayOpacity ?? 0 }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SectionPromo1;
