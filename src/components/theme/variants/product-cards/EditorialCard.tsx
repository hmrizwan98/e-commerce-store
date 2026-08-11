"use client";

import React, { useState } from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import Prices from "@/components/Prices";
import ProductStatus from "@/components/ProductStatus";
import LikeButton from "@/components/LikeButton";
import CompareButton from "@/components/CompareButton";
import ModalQuickView from "@/components/ModalQuickView";
import { showAddToBagToast } from "@/components/AddToBagToast";
import { trackEvent } from "@/lib/analytics/track";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { aspectRatioClass, type ProductCardVariantProps } from "./ProductCardVariantProps";

export default function EditorialCard({ data, className = "", productCardSettings }: ProductCardVariantProps) {
  const { name, price, compareAtPrice, shortDescription, description, badge, images, slug, rating, numberOfReviews } = data;
  const image = safeImageSrc(images[0]);
  const secondaryImage = images[1] ? safeImageSrc(images[1]) : undefined;

  const showWishlist = productCardSettings?.showWishlist ?? true;
  const showCompare = productCardSettings?.showCompare ?? false;
  const showQuickView = productCardSettings?.showQuickView ?? true;
  const showQuickAdd = productCardSettings?.showQuickAdd ?? false;
  const showSecondaryImageOnHover = (productCardSettings?.showSecondaryImageOnHover ?? true) && Boolean(secondaryImage);
  const badgePosition = productCardSettings?.badgePosition ?? "top-left";

  const [showModalQuickView, setShowModalQuickView] = useState(false);

  const sizeAttribute = data.attributes.find((a) => a.type === "text" && a.name.toLowerCase() === "size");
  const sizeHints = (sizeAttribute?.values as string[] | undefined) ?? [];

  return (
    <>
      <div className={`group relative flex flex-col bg-transparent text-center space-y-4 ${className}`}>
        <Link
          href={`/product/${slug}`}
          className="absolute inset-0 z-[1]"
          onClick={() => trackEvent("product_click", { productId: data.id })}
        />

        <div className={`relative w-full ${aspectRatioClass(productCardSettings?.aspectRatio, "3:4")} overflow-hidden bg-stone-100 dark:bg-stone-900 border border-[var(--border)]/40`}>
          <NcImage
            src={image}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
            containerClassName="w-full h-full"
            className={`object-cover w-full h-full transition-opacity duration-500 ${showSecondaryImageOnHover ? "group-hover:opacity-0" : "group-hover:opacity-90"}`}
            alt={name}
          />
          {showSecondaryImageOnHover && secondaryImage && (
            <NcImage
              src={secondaryImage}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
              containerClassName="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              className="object-cover w-full h-full"
              alt={name}
            />
          )}
          <ProductStatus status={badge} position={badgePosition} />
          <div className="absolute top-3 end-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {showWishlist && <LikeButton productId={data.id} />}
            {showCompare && <CompareButton productId={data.id} />}
          </div>
          {showQuickView && (
            <button
              type="button"
              className="absolute bottom-3 inset-x-0 mx-auto w-fit text-[11px] uppercase tracking-[0.2em] text-white bg-black/60 backdrop-blur-sm px-4 py-2 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
              onClick={(e) => {
                e.preventDefault();
                setShowModalQuickView(true);
              }}
            >
              Quick View
            </button>
          )}
        </div>

        <div className="flex flex-col items-center space-y-1.5">
          <h2 className="font-serif text-lg text-[var(--heading)] tracking-wide line-clamp-1">{name}</h2>
          <p className="font-serif text-xs text-[var(--muted)] tracking-wide line-clamp-1">{shortDescription || description}</p>

          <Prices price={price} compareAtPrice={compareAtPrice} contentClass="text-sm font-light tracking-wider" />

          {(rating || 0) > 0 && (
            <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--muted)]">
              {rating} · {numberOfReviews || 0} reviews
            </p>
          )}

          {showQuickAdd && (
            <div className="relative z-10 pt-1">
              {sizeHints.length ? (
                <div className="flex gap-2 justify-center flex-wrap">
                  {sizeHints.map((size, index) => (
                    <button
                      key={index}
                      type="button"
                      className="text-[11px] uppercase tracking-widest border-b border-transparent hover:border-[var(--heading)] transition-colors"
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
                <button
                  type="button"
                  className="text-[11px] uppercase tracking-[0.2em] border-b border-[var(--heading)] pb-0.5"
                  onClick={(e) => {
                    e.preventDefault();
                    showAddToBagToast({ product: data });
                  }}
                >
                  Add to Bag
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showQuickView && (
        <ModalQuickView product={data} show={showModalQuickView} onCloseModalQuickView={() => setShowModalQuickView(false)} />
      )}
    </>
  );
}
