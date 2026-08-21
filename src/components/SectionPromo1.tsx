import React, { FC } from "react";
import NcImage from "@/shared/NcImage/NcImage";
import rightImgDemo from "@/images/rightLargeImg.png";
import rightLargeImgDark from "@/images/rightLargeImgDark.png";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Logo from "@/shared/Logo/Logo";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import type { Banner } from "@/types/banner";
import type { Route } from "@/routers/types";
import { safeImageSrc } from "@/utils/safeImageSrc";

export interface SectionPromo1Props {
  className?: string;
  banner?: Banner;
}

const SectionPromo1: FC<SectionPromo1Props> = ({ className = "", banner }) => {
  const heading = banner?.title ?? "New Arrivals in Jewelry";
  const subHeading = banner?.subtitle ?? banner?.description ?? "Discover our latest handcrafted collection with free shipping & savings combo...";
  const ctaText = banner?.ctaText ?? "Shop Collection";
  const ctaHref = banner?.ctaHref ?? "/collection";
  const ctaText2 = banner?.ctaText2 ?? "Discover more";
  const ctaHref2 = banner?.ctaHref2 ?? "/search";
  const badgeText = banner?.subtitle || "STORE";

  const bannerImg = (banner as any)?.imageDesktop || (banner as any)?.image ? safeImageSrc((banner as any).imageDesktop || (banner as any).image) : null;

  return (
    <div
      className={`nc-SectionPromo1 relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 my-8 ${className}`}
    >
      <div className="w-full lg:w-1/2 space-y-4">
        {badgeText && badgeText !== "STORE" && (
          <span className="text-xs font-bold tracking-widest text-sky-600 dark:text-sky-400 uppercase block">
            {badgeText}
          </span>
        )}
        <Logo className="w-28" />
        <h2 className="font-bold text-3xl sm:text-4xl xl:text-5xl !leading-[1.2] tracking-tight text-slate-900 dark:text-white">
          {heading}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          {subHeading}
        </p>
        <div className="flex items-center space-x-3 sm:space-x-4 pt-4">
          <ButtonPrimary href={ctaHref as Route}>
            {ctaText}
          </ButtonPrimary>
          {ctaText2 && (
            <ButtonSecondary
              href={ctaHref2 as Route}
              className="border border-slate-200 dark:border-slate-700"
            >
              {ctaText2}
            </ButtonSecondary>
          )}
        </div>
      </div>

      <div className="w-full lg:w-1/2 relative rounded-3xl overflow-hidden shadow-sm">
        {bannerImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bannerImg}
            alt={banner?.title || "Promo"}
            className="w-full max-h-[460px] object-cover rounded-3xl shadow-md"
          />
        ) : (
          <>
            <NcImage
              alt=""
              containerClassName="block dark:hidden w-full max-h-[460px] rounded-3xl overflow-hidden"
              src={rightImgDemo}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <NcImage
              alt=""
              containerClassName="hidden dark:block w-full max-h-[460px] rounded-3xl overflow-hidden"
              src={rightLargeImgDark}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </>
        )}
        {banner?.overlayColor && (banner.overlayOpacity ?? 0) > 0 && (
          <div
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{ backgroundColor: banner.overlayColor, opacity: banner.overlayOpacity ?? 0 }}
          />
        )}
      </div>
    </div>
  );
};

export default SectionPromo1;
