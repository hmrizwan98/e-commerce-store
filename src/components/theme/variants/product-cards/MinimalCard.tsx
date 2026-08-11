"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/solid";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import NcImage from "@/shared/NcImage/NcImage";
import Prices from "@/components/Prices";
import ProductStatus from "@/components/ProductStatus";
import LikeButton from "@/components/LikeButton";
import CompareButton from "@/components/CompareButton";
import ModalQuickView from "@/components/ModalQuickView";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import BagIcon from "@/components/BagIcon";
import { showAddToBagToast } from "@/components/AddToBagToast";
import { trackEvent } from "@/lib/analytics/track";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { aspectRatioClass, type ProductCardVariantProps } from "./ProductCardVariantProps";

export default function MinimalCard({ data, className = "", productCardSettings }: ProductCardVariantProps) {
  const { name, price, compareAtPrice, shortDescription, description, badge, images, slug, rating, numberOfReviews } = data;
  const image = safeImageSrc(images[0]);
  const secondaryImage = images[1] ? safeImageSrc(images[1]) : undefined;

  const showWishlist = productCardSettings?.showWishlist ?? true;
  const showCompare = productCardSettings?.showCompare ?? true;
  const showQuickView = productCardSettings?.showQuickView ?? true;
  const showQuickAdd = productCardSettings?.showQuickAdd ?? true;
  const showSecondaryImageOnHover = (productCardSettings?.showSecondaryImageOnHover ?? true) && Boolean(secondaryImage);
  const badgePosition = productCardSettings?.badgePosition ?? "top-left";

  const [showModalQuickView, setShowModalQuickView] = useState(false);

  const colorAttribute = data.attributes.find((a) => a.type === "color");
  const sizeAttribute = data.attributes.find((a) => a.type === "text" && a.name.toLowerCase() === "size");
  const sizeHints = (sizeAttribute?.values as string[] | undefined) ?? [];

  return (
    <>
      <div className={`group relative flex flex-col bg-[var(--card)] rounded-[var(--card-radius,1.5rem)] overflow-hidden transition-all duration-300 border border-[var(--border)] ${className}`}>
        <Link
          href={`/product/${slug}`}
          className="absolute inset-0 z-[1]"
          onClick={() => trackEvent("product_click", { productId: data.id })}
        />

        <div className={`relative w-full ${aspectRatioClass(productCardSettings?.aspectRatio)} overflow-hidden bg-neutral-100 dark:bg-neutral-800`}>
          <NcImage
            src={image}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
            containerClassName="w-full h-full"
            className={`object-cover w-full h-full transition-opacity duration-300 group-hover:scale-105 ${showSecondaryImageOnHover ? "group-hover:opacity-0" : ""}`}
            alt={name}
          />
          {showSecondaryImageOnHover && secondaryImage && (
            <NcImage
              src={secondaryImage}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
              containerClassName="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              className="object-cover w-full h-full"
              alt={name}
            />
          )}
          <ProductStatus status={badge} position={badgePosition} />
          <div className="absolute top-3 end-3 z-10 flex flex-col gap-2">
            {showWishlist && <LikeButton productId={data.id} />}
            {showCompare && <CompareButton productId={data.id} />}
          </div>
          {showQuickAdd && (
            <div className="absolute bottom-0 inset-x-2 flex justify-center gap-1.5 opacity-0 invisible group-hover:bottom-3 group-hover:opacity-100 group-hover:visible transition-all z-[2]">
              {sizeHints.length ? (
                sizeHints.map((size, index) => (
                  <button
                    key={index}
                    type="button"
                    className="nc-shadow-lg w-9 h-9 rounded-full bg-white hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center uppercase font-semibold text-xs text-slate-900"
                    onClick={(e) => {
                      e.preventDefault();
                      showAddToBagToast({ product: data, size });
                    }}
                  >
                    {size}
                  </button>
                ))
              ) : (
                <>
                  <ButtonPrimary
                    className="shadow-lg"
                    fontSize="text-xs"
                    sizeClass="py-2 px-3.5"
                    onClick={() => showAddToBagToast({ product: data })}
                  >
                    <BagIcon className="w-3.5 h-3.5 mb-0.5" />
                    <span className="ms-1">Add to bag</span>
                  </ButtonPrimary>
                  {showQuickView && (
                    <button
                      type="button"
                      className="nc-shadow-lg bg-white rounded-full w-9 h-9 flex items-center justify-center text-slate-900 hover:bg-slate-100 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowModalQuickView(true);
                      }}
                    >
                      <ArrowsPointingOutIcon className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1 justify-between space-y-2">
          <div>
            <h2 className="font-semibold text-base text-[var(--heading)] group-hover:text-[var(--primary-600,#0284c7)] transition-colors line-clamp-1">
              {name}
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1 line-clamp-1">{shortDescription || description}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Prices price={price} compareAtPrice={compareAtPrice} />
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-[var(--muted)]">
                {rating || ""} ({numberOfReviews || 0})
              </span>
            </div>
          </div>
        </div>
      </div>

      {showQuickView && (
        <ModalQuickView product={data} show={showModalQuickView} onCloseModalQuickView={() => setShowModalQuickView(false)} />
      )}
    </>
  );
}
