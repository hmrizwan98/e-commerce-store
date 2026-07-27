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
  const heading = banner?.title ?? (
    <>
      Earn free money <br /> with Ciseco
    </>
  );
  const subHeading = banner?.subtitle ?? banner?.description ?? "With Ciseco you will get freeship & savings combo...";
  const ctaText = banner?.ctaText ?? "Savings combo";
  const ctaHref = banner?.ctaHref ?? "/collection";
  const ctaText2 = banner?.ctaText2 ?? "Discover more";
  const ctaHref2 = banner?.ctaHref2 ?? "/search";

  return (
    <div
      className={`nc-SectionPromo1 relative flex flex-col lg:flex-row items-center ${className}`}
    >
      <div className="relative flex-shrink-0 mb-16 lg:mb-0 lg:mr-10 lg:w-2/5">
        <Logo className="w-28" />
        <h2 className="font-semibold text-3xl sm:text-4xl xl:text-5xl 2xl:text-6xl mt-6 sm:mt-10 !leading-[1.2] tracking-tight">
          {heading}
        </h2>
        <span className="block mt-6 text-slate-500 dark:text-slate-400 ">
          {subHeading}
        </span>
        <div className="flex space-x-2 sm:space-x-5 mt-6 sm:mt-12">
          <ButtonPrimary href={ctaHref as Route} className="">
            {ctaText}
          </ButtonPrimary>
          <ButtonSecondary
            href={ctaHref2 as Route}
            className="border border-slate-100 dark:border-slate-700"
          >
            {ctaText2}
          </ButtonSecondary>
        </div>
      </div>
      <div className="relative flex-1 max-w-xl lg:max-w-none">
        {banner?.imageDesktop ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={safeImageSrc(banner.imageDesktop)} alt={banner.title} className="w-full" />
        ) : (
          <>
            <NcImage
              alt=""
              containerClassName="block dark:hidden"
              src={rightImgDemo}
              sizes="(max-width: 768px) 100vw, 50vw"
              className=""
            />
            <NcImage
              alt=""
              containerClassName="hidden dark:block"
              src={rightLargeImgDark}
              sizes="(max-width: 768px) 100vw, 50vw"
              className=""
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
