import React from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import type { PageSectionConfig } from "@/types/page-section";
import type { Route } from "next";

export default function PageSectionImageText({ config }: { config: PageSectionConfig }) {
  const imageOnRight = config.imagePosition !== "left";

  const textBlock = (
    <div className="flex-1 space-y-4">
      {config.heading && <h2 className="text-2xl sm:text-3xl font-semibold">{config.heading}</h2>}
      {config.body && (
        <div className="prose dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-300" dangerouslySetInnerHTML={{ __html: config.body }} />
      )}
      {config.buttonText && config.buttonHref && (
        <ButtonPrimary href={config.buttonHref as Route}>{config.buttonText}</ButtonPrimary>
      )}
    </div>
  );

  const imageBlock = config.image ? (
    <div className="flex-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={config.image} alt="" className="w-full h-auto rounded-3xl object-cover" />
    </div>
  ) : null;

  return (
    <div className={`flex flex-col md:flex-row items-center gap-10 ${imageOnRight ? "" : "md:flex-row-reverse"}`}>
      {textBlock}
      {imageBlock}
    </div>
  );
}
