import React from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import type { PageSectionConfig } from "@/types/page-section";
import type { Route } from "next";

export default function PageSectionHero({ config }: { config: PageSectionConfig }) {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 min-h-[320px] flex items-center">
      {config.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={config.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className={`relative container py-16 ${config.image ? "text-white" : ""}`}>
        {config.subHeading && <p className="text-base sm:text-lg font-medium mb-3">{config.subHeading}</p>}
        {config.heading && (
          <h1 className="text-3xl sm:text-5xl font-semibold max-w-2xl !leading-[115%]">{config.heading}</h1>
        )}
        {config.buttonText && config.buttonHref && (
          <div className="mt-8">
            <ButtonPrimary href={config.buttonHref as Route}>{config.buttonText}</ButtonPrimary>
          </div>
        )}
      </div>
    </div>
  );
}
