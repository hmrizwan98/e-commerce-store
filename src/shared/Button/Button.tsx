"use client";

import React, { ButtonHTMLAttributes, FC } from "react";
import twFocusClass from "@/utils/twFocusClass";
import { Route } from "@/routers/types";
import Link from "next/link";

export interface ButtonProps {
  className?: string;
  translate?: string;
  sizeClass?: string;
  fontSize?: string;
  //
  loading?: boolean;
  disabled?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  href?: Route;
  targetBlank?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  children?: React.ReactNode;
}

const DEFAULT_SIZE_CLASS = "py-3 px-4 sm:py-3.5 sm:px-6";
const DEFAULT_FONT_SIZE = "text-sm sm:text-base font-medium";

const Button: FC<ButtonProps> = ({
  className = "text-neutral-700 dark:text-neutral-200 disabled:cursor-not-allowed",
  translate = "",
  sizeClass = DEFAULT_SIZE_CLASS,
  fontSize = DEFAULT_FONT_SIZE,
  disabled = false,
  href,
  children,
  targetBlank,
  type,
  loading,
  onClick = () => {},
}) => {
  // Theme "Buttons" settings: buttons using the default size / text get a marker class; the
  // theme compiler only emits rules for them when the admin changed padding, height or weight
  // from the defaults - so an untouched theme renders exactly as before.
  const themeMarkers = `${sizeClass === DEFAULT_SIZE_CLASS ? "nc-btn-theme-size" : ""} ${fontSize === DEFAULT_FONT_SIZE ? "nc-btn-theme-weight" : ""}`;
  const CLASSES =
    `nc-Button ${themeMarkers} relative h-auto inline-flex items-center justify-center gap-2 rounded-[var(--btn-radius)] transition-colors duration-[var(--btn-transition)] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none ${fontSize} ${sizeClass} ${translate} ${className} ` +
    twFocusClass(true);

  const _renderLoading = () => {
    return (
      <svg
        className="animate-spin h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );
  };

  if (!!href) {
    return (
      <Link href={href} className={`${CLASSES} `} onClick={onClick}>
        {children || `This is Link`}
      </Link>
    );
  }

  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${CLASSES}`}
      onClick={onClick}
      type={type}
    >
      {loading && _renderLoading()}
      {children || `This is Button`}
    </button>
  );
};

export default Button;
