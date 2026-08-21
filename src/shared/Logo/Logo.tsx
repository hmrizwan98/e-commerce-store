"use client";

import React from "react";
import Link from "next/link";
import { safeImageSrc } from "@/utils/safeImageSrc";

export interface LogoProps {
  img?: string;
  imgLight?: string;
  className?: string;
  storeName?: string;
  logoHeightPx?: number;
}

const Logo: React.FC<LogoProps> = ({
  img,
  imgLight,
  className = "flex-shrink-0",
  storeName,
  logoHeightPx = 40,
}) => {
  const logoLightSrc = img ? safeImageSrc(img) : undefined;
  const logoDarkSrc = imgLight ? safeImageSrc(imgLight) : undefined;

  const targetHeight = Math.max(20, Math.min(120, logoHeightPx || 40));

  return (
    <Link
      href="/"
      className={`ttnc-logo inline-flex items-center gap-2 focus:outline-none transition-all ${className}`}
      style={{ height: `${targetHeight}px` }}
    >
      {logoLightSrc ? (
        <div
          className="relative flex items-center justify-start w-auto"
          style={{ height: `${targetHeight}px` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`w-auto object-contain transition-all ${
              logoDarkSrc ? "dark:hidden" : ""
            }`}
            style={{ height: `${targetHeight}px`, maxHeight: `${targetHeight}px` }}
            src={logoLightSrc}
            alt={storeName || "Store Logo"}
          />
          {logoDarkSrc && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className="hidden w-auto object-contain dark:block transition-all"
              style={{ height: `${targetHeight}px`, maxHeight: `${targetHeight}px` }}
              src={logoDarkSrc}
              alt={storeName || "Store Logo Dark"}
            />
          )}
        </div>
      ) : (
        <span
          className="font-extrabold text-slate-900 dark:text-white tracking-tight uppercase hover:opacity-90 transition-opacity font-sans flex items-center"
          style={{ fontSize: `${Math.max(16, Math.min(36, targetHeight * 0.55))}px` }}
        >
          {storeName || "Store"}
        </span>
      )}
    </Link>
  );
};

export default Logo;
