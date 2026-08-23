"use client";

import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import SectionSliderProductCard from "@/components/SectionSliderProductCard";
import ReviewItem from "@/components/ReviewItem";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import SectionPromo2 from "@/components/SectionPromo2";
import ModalViewAllReviews from "@/app/product-detail/ModalViewAllReviews";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import type { Product } from "@/types/product";
import type { Review } from "@/types/review";
import type { ProductCardThemeConfig, ProductDetailThemeConfig } from "@/lib/theme/theme-types";

export interface RelatedRailsAndReviewsProps {
  product: Product;
  reviews: Review[];
  relatedProducts: Product[];
  crossSellProducts: Product[];
  upsellProducts: Product[];
  productCardSettings?: ProductCardThemeConfig;
  productDetailSettings?: ProductDetailThemeConfig;
  isOpenModalViewAllReviews: boolean;
  setIsOpenModalViewAllReviews: (open: boolean) => void;
}

export default function RelatedRailsAndReviews({
  product,
  reviews,
  relatedProducts,
  crossSellProducts,
  upsellProducts,
  productCardSettings,
  productDetailSettings,
  isOpenModalViewAllReviews,
  setIsOpenModalViewAllReviews,
}: RelatedRailsAndReviewsProps) {
  const showReviews = productDetailSettings?.showReviews ?? true;
  const showRelated = productDetailSettings?.showRelatedProducts ?? true;
  const showPromo = productDetailSettings?.showBottomPromo ?? true;

  return (
    <div className="mt-12 sm:mt-16 space-y-10 sm:space-y-16 pb-20 lg:pb-32">
      {showReviews && (
        <>
          <hr className="border-slate-200 dark:border-slate-700" />
          <div id="reviews">
            <h2 className="text-2xl font-semibold flex items-center">
              <StarIcon className="w-7 h-7 mb-0.5" />
              <span className="ml-1.5">
                {product.rating ? product.rating.toFixed(1) : "New"} · {product.numberOfReviews || 0} Reviews
              </span>
            </h2>

            <div className="mt-10">
              {reviews.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-11 gap-x-28">
                  {reviews.slice(0, 4).map((review) => (
                    <ReviewItem
                      key={review.id}
                      data={{
                        name: review.userName,
                        avatar: review.userAvatar,
                        date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "",
                        comment: review.comment,
                        starPoint: review.rating,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No reviews yet for this product.</p>
              )}

              {reviews.length > 0 && (
                <ButtonSecondary
                  onClick={() => setIsOpenModalViewAllReviews(true)}
                  className="mt-10 border border-slate-300 dark:border-slate-700 "
                >
                  Show me all {product.numberOfReviews || reviews.length} reviews
                </ButtonSecondary>
              )}
            </div>
          </div>
        </>
      )}

      {showRelated && (
        <>
          <hr className="border-slate-200 dark:border-slate-700" />
          <SectionSliderProductCard
            heading="Customers also purchased"
            subHeading=""
            headingFontClassName="text-2xl font-semibold"
            headingClassName="mb-10 text-neutral-900 dark:text-neutral-50"
            data={relatedProducts.length ? relatedProducts : undefined}
            productCardSettings={productCardSettings}
          />
        </>
      )}

      {crossSellProducts.length > 0 && (
        <SectionSliderProductCard
          heading="Frequently bought together"
          subHeading=""
          headingFontClassName="text-2xl font-semibold"
          headingClassName="mb-10 text-neutral-900 dark:text-neutral-50"
          data={crossSellProducts}
          productCardSettings={productCardSettings}
        />
      )}

      {upsellProducts.length > 0 && (
        <SectionSliderProductCard
          heading="You may also like"
          subHeading=""
          headingFontClassName="text-2xl font-semibold"
          headingClassName="mb-10 text-neutral-900 dark:text-neutral-50"
          data={upsellProducts}
          productCardSettings={productCardSettings}
        />
      )}

      <RecentlyViewedSection excludeProductId={product.id} productCardSettings={productCardSettings} />

      {showPromo && (
        <div className="pb-20 xl:pb-28 lg:pt-14">
          <SectionPromo2 />
        </div>
      )}

      <ModalViewAllReviews
        show={isOpenModalViewAllReviews}
        onCloseModalViewAllReviews={() => setIsOpenModalViewAllReviews(false)}
        reviews={reviews}
        rating={product.rating}
      />
    </div>
  );
}
