import React, { FC } from "react";
import NcImage from "@/shared/NcImage/NcImage";
import rightImgDemo from "@/images/promo2.png";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Logo from "@/shared/Logo/Logo";
import backgroundLineSvg from "@/images/Moon.svg";
import type { Banner } from "@/types/banner";
import type { Route } from "@/routers/types";
import { safeImageSrc } from "@/utils/safeImageSrc";

export interface SectionPromo2Props {
  className?: string;
  banner?: Banner;
}

const SectionPromo2: FC<SectionPromo2Props> = ({ className = "lg:pt-10", banner }) => {
  const heading = banner?.title ?? "Special offer in kids products";
  const subHeading =
    banner?.subtitle ??
    banner?.description ??
    "Fashion is a form of self-expression and autonomy at a particular period and place.";
  const ctaText = banner?.ctaText ?? "Discover more";
  const ctaHref = banner?.ctaHref ?? "/search";
  const badgeText = banner?.subtitle || "STORE";

  const bannerImg = (banner as any)?.imageDesktop || (banner as any)?.image ? safeImageSrc((banner as any).imageDesktop || (banner as any).image) : null;

  return (
    <div className={`nc-SectionPromo2 ${className}`}>
      <div className="relative flex flex-col-reverse lg:flex-row items-center justify-between bg-yellow-50/80 dark:bg-slate-800/80 rounded-3xl p-6 sm:p-10 lg:p-16 overflow-hidden gap-8">
        <div className="absolute inset-0 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-full h-full object-contain dark:opacity-5"
            src={backgroundLineSvg.src}
            alt=""
          />
        </div>

        {/* Image Container on Left */}
        <div className="relative w-full lg:w-1/2 flex items-center justify-center z-[1]">
          {bannerImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bannerImg}
              alt={banner?.title || "Promo"}
              className="w-full max-h-[420px] object-cover rounded-2xl shadow-lg"
            />
          ) : (
            <NcImage
              alt=""
              containerClassName="w-full max-h-[420px] rounded-2xl overflow-hidden shadow-sm"
              src={rightImgDemo}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
          {banner?.overlayColor && (banner.overlayOpacity ?? 0) > 0 && (
            <div
              className="absolute inset-0 z-[1] pointer-events-none rounded-2xl overflow-hidden"
              style={{ backgroundColor: banner.overlayColor, opacity: banner.overlayOpacity ?? 0 }}
            />
          )}
        </div>

        {/* Text Copy on Right */}
        <div className="w-full lg:w-1/2 relative z-[1] space-y-4">
          {badgeText && badgeText !== "STORE" && (
            <span className="text-xs font-bold tracking-widest text-amber-700 dark:text-amber-400 uppercase block">
              {badgeText}
            </span>
          )}
          <Logo className="w-28" />
          <h2 className="font-bold text-3xl sm:text-4xl xl:text-5xl !leading-[1.15] tracking-tight text-slate-900 dark:text-white">
            {heading}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {subHeading}
          </p>
          <div className="pt-4 flex items-center gap-4">
            <ButtonPrimary
              href={ctaHref as Route}
              className="dark:bg-slate-200 dark:text-slate-900 shadow-md"
            >
              {ctaText}
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionPromo2;
