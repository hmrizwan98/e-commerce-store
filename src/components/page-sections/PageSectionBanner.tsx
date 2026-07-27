import React from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import type { PageSectionConfig } from "@/types/page-section";
import type { Route } from "next";

export default function PageSectionBanner({ config }: { config: PageSectionConfig }) {
  return (
    <div className="relative rounded-3xl overflow-hidden min-h-[220px] flex items-center justify-center text-center bg-neutral-900">
      {config.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={config.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
      )}
      <div className="relative py-12 px-6 text-white space-y-3">
        {config.subHeading && <p className="text-sm font-medium uppercase tracking-wide">{config.subHeading}</p>}
        {config.heading && <h2 className="text-2xl sm:text-4xl font-semibold">{config.heading}</h2>}
        {config.buttonText && config.buttonHref && (
          <div className="pt-2">
            <ButtonPrimary href={config.buttonHref as Route}>{config.buttonText}</ButtonPrimary>
          </div>
        )}
      </div>
    </div>
  );
}
