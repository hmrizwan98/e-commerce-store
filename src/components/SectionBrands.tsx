import React, { FC } from "react";
import Link from "next/link";
import Image from "next/image";
import Heading from "@/components/Heading/Heading";
import type { Route } from "@/routers/types";
import type { Brand } from "@/types/brand";
import { safeImageSrc } from "@/utils/safeImageSrc";

export interface SectionBrandsProps {
  className?: string;
  heading?: string;
  subHeading?: string;
  data?: Brand[];
}

const SectionBrands: FC<SectionBrandsProps> = ({
  className = "",
  heading = "Our Brands",
  subHeading = "",
  data = [],
}) => {
  if (!data.length) return null;

  return (
    <div className={`nc-SectionBrands ${className}`}>
      <Heading desc={subHeading}>{heading}</Heading>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 items-center">
        {data.map((brand) => (
          <Link
            key={brand.id}
            href={`/brand/${brand.slug}` as Route}
            className="relative flex items-center justify-center h-16 md:h-20 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition"
          >
            {brand.logo ? (
              <Image
                src={safeImageSrc(brand.logo)}
                alt={brand.name}
                fill
                sizes="150px"
                className="object-contain"
              />
            ) : (
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                {brand.name}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SectionBrands;
