import React, { FC } from "react";
import twFocusClass from "@/utils/twFocusClass";
import Link from "next/link";
import type { Route } from "@/routers/types";

export interface PaginationProps {
  className?: string;
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

const Pagination: FC<PaginationProps> = ({
  className = "",
  currentPage,
  totalPages,
  buildHref,
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const renderItem = (page: number) => {
    if (page === currentPage) {
      return (
        <span
          key={page}
          className={`inline-flex w-11 h-11 items-center justify-center rounded-full bg-primary-6000 text-white ${twFocusClass()}`}
        >
          {page}
        </span>
      );
    }
    return (
      <Link
        key={page}
        className={`inline-flex w-11 h-11 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`}
        href={buildHref(page) as Route}
      >
        {page}
      </Link>
    );
  };

  return (
    <nav
      className={`nc-Pagination inline-flex space-x-1 text-base font-medium ${className}`}
    >
      {pages.map(renderItem)}
    </nav>
  );
};

export default Pagination;
