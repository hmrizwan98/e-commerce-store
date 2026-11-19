import React, { FC } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import backgroundLineSvg from "@/images/Moon.svg";
import type { Banner } from "@/types/banner";
import type { Route } from "@/routers/types";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { getObjectPositionClass } from "@/lib/banners/position";
import { isSampleBanner } from "@/lib/seed-content";

export interface SectionPromo2Props {
  className?: string;
  banner?: Banner;
  heading?: string;
  subHeading?: string;
  ctaText?: string;
  ctaHref?: string;
  badgeText?: string;
}

const SectionPromo2: FC<SectionPromo2Props> = ({
  className = "lg:pt-10",
  banner,
  heading: customHeading,
  subHeading: customSubHeading,
  ctaText: customCtaText,
  ctaHref: customCtaHref,
  badgeText: customBadgeText,
}) => {
  // Hide if it's installer sample content (e.g. "Beauty Essentials") and merchant has not entered real custom content
  const isSample = Boolean(
    (banner && isSampleBanner(banner)) ||
    (!customHeading && banner?.title === "Beauty Essentials")
  );
  if (isSample && !customHeading && !customSubHeading) {
    return null;
  }

  // Store Admin → Promo Banners (or the section's own text) only - no demo copy or illustration.
  const heading = banner?.title || customHeading;
  const subHeading = banner?.description || banner?.subtitle || customSubHeading;
  const ctaText = banner?.ctaText || customCtaText || "Shop now";
  const ctaHref = banner?.ctaHref || customCtaHref || "/collection";
  const badgeText = customBadgeText || banner?.badgeText;

  const bannerImg = (banner as any)?.imageDesktop || (banner as any)?.image ? safeImageSrc((banner as any).imageDesktop || (banner as any).image) : null;
  const mobileImg = (banner as any)?.imageMobile ? safeImageSrc((banner as any).imageMobile) : null;
  const bgPosClass = getObjectPositionClass((banner as any)?.backgroundPosition);
  if (!heading && !bannerImg) return null;

  return (
    <div className={`nc-SectionPromo2 ${className}`}>
      <div className={`relative flex flex-col-reverse ${bannerImg ? "lg:flex-row items-center justify-between" : "items-center justify-center text-center"} bg-amber-500/10 dark:bg-slate-800/80 border border-amber-500/20 dark:border-slate-700/60 rounded-3xl p-6 sm:p-10 lg:p-14 overflow-hidden gap-8`}>
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-full h-full object-contain dark:opacity-5"
            src={backgroundLineSvg.src}
            alt=""
          />
        </div>

        {/* Image Container on Left (Only when bannerImg exists) */}
        {bannerImg && (
          <div className="relative w-full lg:w-1/2 flex items-center justify-center z-[1]">
            <picture className="block w-full">
              {mobileImg && (
                <source media="(max-width: 767px)" srcSet={mobileImg} />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerImg}
                alt={heading || "Promotion"}
                className={`w-full max-h-[420px] object-cover rounded-2xl shadow-lg ${bgPosClass}`}
              />
            </picture>
            {banner?.overlayColor && (banner.overlayOpacity ?? 0) > 0 && (
              <div
                className="absolute inset-0 z-[1] pointer-events-none rounded-2xl overflow-hidden"
                style={{ backgroundColor: banner.overlayColor, opacity: banner.overlayOpacity ?? 0 }}
              />
            )}
          </div>
        )}

        {/* Text Copy on Right (or centered when no image) */}
        <div className={`w-full ${bannerImg ? "lg:w-1/2" : "max-w-2xl mx-auto"} relative z-[1] space-y-4`}>
          {badgeText && (
            <span className="text-xs font-bold tracking-widest text-amber-700 dark:text-amber-400 uppercase block">
              {badgeText}
            </span>
          )}
          {heading && (
            <h2 className="font-bold text-3xl sm:text-4xl xl:text-5xl !leading-[1.15] tracking-tight text-slate-900 dark:text-white">
              {heading}
            </h2>
          )}
          {subHeading && (
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {subHeading}
            </p>
          )}
          <div className={`pt-3 flex items-center gap-4 ${bannerImg ? "" : "justify-center"}`}>
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
