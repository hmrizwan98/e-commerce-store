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

export default function BoldGridCard({ data, className = "", productCardSettings }: ProductCardVariantProps) {
  const { name, price, compareAtPrice, shortDescription, description, badge, images, slug, rating, numberOfReviews } = data;
  const image = safeImageSrc(images[0]);
  const secondaryImage = images[1] ? safeImageSrc(images[1]) : undefined;

  const showWishlist = productCardSettings?.showWishlist ?? true;
  const showCompare = productCardSettings?.showCompare ?? true;
  const showQuickView = productCardSettings?.showQuickView ?? true;
  const showQuickAdd = productCardSettings?.showQuickAdd ?? true;
  const showSecondaryImageOnHover = (productCardSettings?.showSecondaryImageOnHover ?? true) && Boolean(secondaryImage);
  const badgePosition = productCardSettings?.badgePosition ?? "top-right";

  const [showModalQuickView, setShowModalQuickView] = useState(false);

  const colorAttribute = data.attributes.find((a) => a.type === "color");
  const sizeAttribute = data.attributes.find((a) => a.type === "text" && a.name.toLowerCase() === "size");
  const sizeHints = (sizeAttribute?.values as string[] | undefined) ?? [];

  return (
    <>
      <div className={`group relative flex flex-col bg-[var(--card)] rounded-lg overflow-hidden border-2 border-[var(--border)] hover:border-[var(--primary-600,#dc2626)] transition-all shadow-sm ${className}`}>
        <Link
          href={`/product/${slug}`}
          className="absolute inset-0 z-[1]"
          onClick={() => trackEvent("product_click", { productId: data.id })}
        />

        <div className={`relative w-full ${aspectRatioClass(productCardSettings?.aspectRatio)} overflow-hidden bg-slate-100`}>
          <NcImage
            src={image}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
            containerClassName="w-full h-full"
            className={`object-cover w-full h-full transition-opacity duration-200 group-hover:scale-110 ${showSecondaryImageOnHover ? "group-hover:opacity-0" : ""}`}
            alt={name}
          />
          {showSecondaryImageOnHover && secondaryImage && (
            <NcImage
              src={secondaryImage}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
              containerClassName="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              className="object-cover w-full h-full"
              alt={name}
            />
          )}
          {badge && <ProductStatus status={badge} position={badgePosition} />}
          <div className="absolute top-3 start-3 z-10 flex flex-col gap-2">
            {showWishlist && <LikeButton productId={data.id} />}
            {showCompare && <CompareButton productId={data.id} />}
          </div>
          {showQuickAdd && showQuickView && (
            <button
              type="button"
              className="absolute bottom-3 end-3 z-10 nc-shadow-lg bg-white rounded-md w-9 h-9 flex items-center justify-center text-slate-900 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
              onClick={(e) => {
                e.preventDefault();
                setShowModalQuickView(true);
              }}
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
          {colorAttribute && colorAttribute.values.length > 0 && (
            <div className="flex space-x-1">
              {colorAttribute.values.slice(0, 5).map((value, index) => {
                const hex = typeof value === "string" ? undefined : value.hex;
                return (
                  <span
                    key={index}
                    className="relative w-4 h-4 rounded-sm border border-[var(--border)]"
                    style={{ backgroundColor: hex || "#94a3b8" }}
                  />
                );
              })}
            </div>
          )}

          <h2 className="font-bold text-base text-[var(--heading)] uppercase tracking-tight line-clamp-2">{name}</h2>
          <p className="text-xs text-[var(--muted)] line-clamp-1">{shortDescription || description}</p>

          <div className="flex items-center justify-between">
            <Prices price={price} compareAtPrice={compareAtPrice} contentClass="text-lg font-black" />
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-[var(--muted)]">
                {rating || ""} ({numberOfReviews || 0})
              </span>
            </div>
          </div>

          {showQuickAdd &&
            (sizeHints.length ? (
              <div className="flex gap-1.5 flex-wrap relative z-10">
                {sizeHints.map((size, index) => (
                  <button
                    key={index}
                    type="button"
                    className="border-2 border-[var(--border)] hover:border-[var(--primary-600,#dc2626)] rounded-md px-2.5 py-1 text-xs font-bold uppercase transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      showAddToBagToast({ product: data, size });
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            ) : (
              <ButtonPrimary
                className="w-full py-2 text-xs uppercase font-bold tracking-wider relative z-10"
                onClick={() => showAddToBagToast({ product: data })}
              >
                <BagIcon className="w-3.5 h-3.5 mb-0.5" />
                <span className="ms-1">Add to bag</span>
              </ButtonPrimary>
            ))}
        </div>
      </div>

      {showQuickView && (
        <ModalQuickView product={data} show={showModalQuickView} onCloseModalQuickView={() => setShowModalQuickView(false)} />
      )}
    </>
  );
}
