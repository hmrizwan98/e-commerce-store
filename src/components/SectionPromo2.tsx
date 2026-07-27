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
  const heading = banner?.title ?? (
    <>
      Special offer <br />
      in kids products
    </>
  );
  const subHeading =
    banner?.subtitle ??
    banner?.description ??
    "Fashion is a form of self-expression and autonomy at a particular period and place.";
  const ctaText = banner?.ctaText ?? "Discover more";
  const ctaHref = banner?.ctaHref ?? "/search";

  return (
    <div className={`nc-SectionPromo2 ${className}`}>
      <div className="relative flex flex-col lg:flex-row lg:justify-end bg-yellow-50 dark:bg-slate-800 rounded-2xl sm:rounded-[40px] p-4 pb-0 sm:p-5 sm:pb-0 lg:p-24">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="absolute inset-0 w-full h-full object-contain dark:opacity-5"
            src={backgroundLineSvg.src}
            alt=""
          />
        </div>

        <div className="lg:w-[45%] max-w-lg relative">
          <Logo className="w-28" />
          <h2 className="font-semibold text-3xl sm:text-4xl xl:text-5xl 2xl:text-6xl mt-6 sm:mt-10 !leading-[1.13] tracking-tight">
            {heading}
          </h2>
          <span className="block mt-6 text-slate-500 dark:text-slate-400">
            {subHeading}
          </span>
          <div className="flex space-x-2 sm:space-x-5 mt-6 sm:mt-12">
            <ButtonPrimary
              href={ctaHref as Route}
              className="dark:bg-slate-200 dark:text-slate-900"
            >
              {ctaText}
            </ButtonPrimary>
          </div>
        </div>

        <div className="relative block lg:absolute lg:left-0 lg:bottom-0 mt-10 lg:mt-0 max-w-xl lg:max-w-[calc(55%-40px)] w-full">
          {banner?.imageDesktop ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={safeImageSrc(banner.imageDesktop)} alt={banner.title} className="w-full" />
          ) : (
            <NcImage
              alt=""
              containerClassName=""
              src={rightImgDemo}
              sizes="(max-width: 768px) 100vw, 50vw"
              className=""
            />
          )}
          {banner?.overlayColor && (banner.overlayOpacity ?? 0) > 0 && (
            <div
              className="absolute inset-0 z-[1] pointer-events-none"
              style={{ backgroundColor: banner.overlayColor, opacity: banner.overlayOpacity ?? 0 }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionPromo2;
