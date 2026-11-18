"use client";

import React, { FC } from "react";
import { activeSocialLinks } from "@/components/FooterSocials";
import { useSocialLinks } from "@/lib/tenant/SocialLinksContext";

export interface SocialsList1Props {
  className?: string;
}

/** The store's own social links only (Settings → General); none set -> nothing rendered. */
const SocialsList1: FC<SocialsList1Props> = ({ className = "space-y-3" }) => {
  const items = activeSocialLinks(useSocialLinks());
  if (!items.length) return null;
  return (
    <div className={`nc-SocialsList1 ${className}`} data-nc-id="SocialsList1">
      {items.map((item) => (
        <a
          key={item.key}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-2xl text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white leading-none space-x-2 group"
        >
          <div className="flex-shrink-0 w-5 flex items-center justify-center">{item.icon}</div>
          <span className="hidden lg:block text-sm">{item.name}</span>
        </a>
      ))}
    </div>
  );
};

export default SocialsList1;
