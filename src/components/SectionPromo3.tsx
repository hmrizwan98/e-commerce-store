import React, { FC } from "react";
import backgroundLineSvg from "@/images/BackgroundLine.svg";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import type { Banner } from "@/types/banner";
import type { Route } from "@/routers/types";
import { safeImageSrc } from "@/utils/safeImageSrc";

export interface SectionPromo3Props {
  className?: string;
  banner?: Banner;
}

/**
 * Promo slot 3 - Store Admin → Promo Banners only. The old version showed a made-up
 * "Savings combos / Freeship / Premium magazines" list and an email form that submitted nowhere.
 */
const SectionPromo3: FC<SectionPromo3Props> = ({ className = "lg:pt-10", banner }) => {
  const heading = banner?.title;
  const subHeading = banner?.description || banner?.subtitle;
  const image = (banner as any)?.imageDesktop || (banner as any)?.image;
  if (!heading && !image) return null;

  return (
    <div className={`nc-SectionPromo3 ${className}`}>
      <div className="relative flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-800 rounded-2xl sm:rounded-[40px] p-4 pb-0 sm:p-5 sm:pb-0 lg:p-24">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="absolute inset-0 w-full h-full object-contain object-bottom dark:opacity-5"
            src={backgroundLineSvg.src}
            alt=""
          />
        </div>

        <div className="lg:w-[50%] max-w-lg relative pb-6 lg:pb-0">
          {banner?.badgeText && (
            <span className="block mb-3 text-xs font-bold tracking-widest uppercase text-neutral-500">{banner.badgeText}</span>
          )}
          {heading && <h2 className="font-semibold text-4xl md:text-5xl">{heading}</h2>}
          {subHeading && <span className="block mt-5 text-neutral-500 dark:text-neutral-400">{subHeading}</span>}
          {banner?.ctaText && banner?.ctaHref && (
            <div className="mt-10">
              <ButtonPrimary href={banner.ctaHref as Route}>{banner.ctaText}</ButtonPrimary>
            </div>
          )}
        </div>

        {image && (
          <div className="relative block lg:absolute lg:right-0 lg:bottom-0 mt-10 lg:mt-0 max-w-lg lg:max-w-[calc(50%-40px)] w-full">
            <picture className="block w-full">
              {banner?.imageMobile && (
                <source media="(max-width: 767px)" srcSet={safeImageSrc(banner.imageMobile)} />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={safeImageSrc(image)} alt={heading || "Promotion"} className="w-full object-contain" />
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
    </div>
  );
};

export default SectionPromo3;
