"use client";

import React, { FC } from "react";
import { activeSocialLinks } from "@/components/FooterSocials";
import { useSocialLinks } from "@/lib/tenant/SocialLinksContext";

export interface SocialsListProps {
  className?: string;
  itemClass?: string;
}

/** The store's own social links only (Settings → General); none set -> nothing rendered. */
const SocialsList: FC<SocialsListProps> = ({ className = "", itemClass = "block w-6 h-6" }) => {
  const items = activeSocialLinks(useSocialLinks());
  if (!items.length) return null;
  return (
    <nav className={`nc-SocialsList flex space-x-2.5 text-2xl text-neutral-6000 dark:text-neutral-300 ${className}`}>
      {items.map((item) => (
        <a key={item.key} className={`${itemClass} flex items-center justify-center`} href={item.href} target="_blank" rel="noopener noreferrer" title={item.name}>
          {item.icon}
        </a>
      ))}
    </nav>
  );
};

export default SocialsList;
