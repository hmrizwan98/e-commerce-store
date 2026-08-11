"use client";

import React, { FC, useState } from "react";
import LikeButton from "./LikeButton";
import CompareButton from "./CompareButton";
import Prices from "./Prices";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import type { Product } from "@/types/product";
import { StarIcon } from "@heroicons/react/24/solid";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import BagIcon from "./BagIcon";
import { showAddToBagToast } from "./AddToBagToast";
import ModalQuickView from "./ModalQuickView";
import ProductStatus from "./ProductStatus";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import { trackEvent } from "@/lib/analytics/track";
import { safeImageSrc } from "@/utils/safeImageSrc";

export interface ProductCardProps {
  className?: string;
  data: Product;
  isLiked?: boolean;
}

const ProductCard: FC<ProductCardProps> = ({
  className = "",
  data,
  isLiked,
}) => {
  const {
    name,
    price,
    compareAtPrice,
    shortDescription,
    description,
    badge,
    images,
    rating,
    slug,
    numberOfReviews,
  } = data;

  const image = safeImageSrc(images[0]);
  // Color-type attribute swatches render straight off the product doc (zero
  // extra reads across a grid of cards). Image/style-type swatches and true
  // per-size stock are PDP-only (would otherwise be an N+1 variants fetch here).
  const colorAttribute = data.attributes.find((a) => a.type === "color");
  const sizeAttribute = data.attributes.find(
    (a) => a.type === "text" && a.name.toLowerCase() === "size"
  );
  const sizeHints = (sizeAttribute?.values as string[] | undefined) ?? [];

  const [colorActive, setColorActive] = useState(0);
  const [showModalQuickView, setShowModalQuickView] = useState(false);

  const notifyAddTocart = ({ size }: { size?: string }) => {
    const colorLabel = colorAttribute
      ? typeof colorAttribute.values[colorActive] === "string"
        ? (colorAttribute.values[colorActive] as string)
        : (colorAttribute.values[colorActive] as { label: string }).label
      : undefined;
    showAddToBagToast({ product: data, size, colorLabel });
  };

  const getBorderClass = (hex?: string) => {
    return hex ? "border-slate-900 dark:border-slate-100" : "border-transparent";
  };

  const renderVariants = () => {
    if (!colorAttribute || !colorAttribute.values.length) {
      return null;
    }

    return (
      <div className="flex space-x-1">
        {colorAttribute.values.map((value, index) => {
          const hex = typeof value === "string" ? undefined : value.hex;
          const label = typeof value === "string" ? value : value.label;
          return (
            <div
              key={index}
              onClick={() => setColorActive(index)}
              className={`relative w-6 h-6 rounded-full overflow-hidden z-10 border cursor-pointer ${
                colorActive === index ? getBorderClass(hex) : "border-transparent"
              }`}
              title={label}
            >
              <div
                className="absolute inset-0.5 rounded-full z-0"
                style={{ backgroundColor: hex || "#94a3b8" }}
              ></div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderGroupButtons = () => {
    return (
      <div className="absolute bottom-0 group-hover:bottom-4 inset-x-1 flex justify-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <ButtonPrimary
          className="shadow-lg"
          fontSize="text-xs"
          sizeClass="py-2 px-4"
          onClick={() => notifyAddTocart({})}
        >
          <BagIcon className="w-3.5 h-3.5 mb-0.5" />
          <span className="ms-1">Add to bag</span>
        </ButtonPrimary>
        <ButtonSecondary
          className="ms-1.5 bg-white hover:!bg-gray-100 hover:text-slate-900 transition-colors shadow-lg"
          fontSize="text-xs"
          sizeClass="py-2 px-4"
          onClick={() => setShowModalQuickView(true)}
        >
          <ArrowsPointingOutIcon className="w-3.5 h-3.5" />
          <span className="ms-1">Quick view</span>
        </ButtonSecondary>
      </div>
    );
  };

  const renderSizeList = () => {
    if (!sizeHints.length) {
      return null;
    }

    return (
      <div className="absolute bottom-0 inset-x-1 space-x-1.5 rtl:space-x-reverse flex justify-center opacity-0 invisible group-hover:bottom-4 group-hover:opacity-100 group-hover:visible transition-all">
        {sizeHints.map((size, index) => {
          return (
            <div
              key={index}
              className="nc-shadow-lg w-10 h-10 rounded-xl bg-white hover:bg-slate-900 hover:text-white transition-colors cursor-pointer flex items-center justify-center uppercase font-semibold tracking-tight text-sm text-slate-900"
              onClick={() => notifyAddTocart({ size })}
            >
              {size}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div
        className={`nc-ProductCard relative flex flex-col bg-transparent rounded-[var(--product-card-radius)] ${className}`}
      >
        <Link
          href={`/product/${slug}`}
          className="absolute inset-0"
          onClick={() => trackEvent("product_click", { productId: data.id })}
        ></Link>

        <div className="relative flex-shrink-0 bg-slate-50 dark:bg-slate-300 rounded-[var(--product-image-radius)] overflow-hidden z-1 group">
          <Link href={`/product/${slug}`} className="block">
            <NcImage
              containerClassName="flex aspect-w-11 aspect-h-12 w-full h-0"
              src={image}
              className="object-cover w-full h-full drop-shadow-xl"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
              alt={name}
            />
          </Link>
          <ProductStatus status={badge} />
          <LikeButton liked={isLiked} productId={data.id} className="absolute top-3 end-3 z-10" />
          <CompareButton productId={data.id} className="absolute top-14 end-3 z-10" />
          {sizeHints.length ? renderSizeList() : renderGroupButtons()}
        </div>

        <div className="space-y-4 px-2.5 pt-5 pb-2.5">
          {renderVariants()}
          <div>
            <h2 className="nc-ProductCard__title text-base font-semibold transition-colors">
              {name}
            </h2>
            <p className={`text-sm text-slate-500 dark:text-slate-400 mt-1 `}>
              {shortDescription || description}
            </p>
          </div>

          <div className="flex justify-between items-end ">
            <Prices price={price} compareAtPrice={compareAtPrice} />
            <div className="flex items-center mb-0.5">
              <StarIcon className="w-5 h-5 pb-[1px] text-amber-400" />
              <span className="text-sm ms-1 text-slate-500 dark:text-slate-400">
                {rating || ""} ({numberOfReviews || 0} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICKVIEW */}
      <ModalQuickView
        product={data}
        show={showModalQuickView}
        onCloseModalQuickView={() => setShowModalQuickView(false)}
      />
    </>
  );
};

export default ProductCard;
