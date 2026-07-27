import React from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import type { PageSectionConfig } from "@/types/page-section";
import type { Route } from "next";

export default function PageSectionCta({ config }: { config: PageSectionConfig }) {
  return (
    <div className="text-center rounded-3xl bg-neutral-100 dark:bg-neutral-800 py-16 px-6 space-y-4">
      {config.heading && <h2 className="text-2xl sm:text-3xl font-semibold">{config.heading}</h2>}
      {config.body && <p className="text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto">{config.body}</p>}
      {config.buttonText && config.buttonHref && (
        <div className="pt-2">
          <ButtonPrimary href={config.buttonHref as Route}>{config.buttonText}</ButtonPrimary>
        </div>
      )}
    </div>
  );
}
