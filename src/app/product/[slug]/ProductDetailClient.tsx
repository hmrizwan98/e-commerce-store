"use client";

import React, { useEffect, useState } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import LikeButton from "@/components/LikeButton";
import CompareButton from "@/components/CompareButton";
import ProductGallery from "@/components/theme/variants/product-detail/ProductGallery";
import { StarIcon } from "@heroicons/react/24/solid";
import BagIcon from "@/components/BagIcon";
import NcInputNumber from "@/components/NcInputNumber";
import Prices from "@/components/Prices";
import toast from "react-hot-toast";
import SectionSliderProductCard from "@/components/SectionSliderProductCard";
import Policy from "@/app/product-detail/Policy";
import ReviewItem from "@/components/ReviewItem";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import SectionPromo2 from "@/components/SectionPromo2";
import ModalViewAllReviews from "@/app/product-detail/ModalViewAllReviews";
import NotifyAddTocart from "@/components/NotifyAddTocart";
import AccordionInfo from "@/components/AccordionInfo";
import ProductStatus from "@/components/ProductStatus";
import { useProductOptions } from "@/hooks/useProductOptions";
import { recordRecentlyViewed } from "@/hooks/useRecentlyViewed";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import { useAppDispatch } from "@/utils/hooks/store";
import { addItem } from "@/store/slices/cartSlice";
import { trackEvent } from "@/lib/analytics/track";
import type { Product, ProductVariant } from "@/types/product";
import type { Review } from "@/types/review";
import type { ProductCardThemeConfig } from "@/lib/theme/theme-types";

export interface ProductDetailClientProps {
  product: Product;
  variants: ProductVariant[];
  relatedProducts: Product[];
  reviews: Review[];
  crossSellProducts?: Product[];
  upsellProducts?: Product[];
  productCardSettings?: ProductCardThemeConfig;
}

const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product,
  variants,
  relatedProducts,
  reviews,
  crossSellProducts = [],
  upsellProducts = [],
  productCardSettings,
}) => {
  const {
    selections,
    selectAttribute,
    matchedVariant,
    activeImage,
    activePrice,
    activeStock,
    isOutOfStock,
  } = useProductOptions(product, variants);
  const [qualitySelected, setQualitySelected] = useState(1);
  const [isOpenModalViewAllReviews, setIsOpenModalViewAllReviews] =
    useState(false);

  useEffect(() => {
    recordRecentlyViewed(product.id);
    trackEvent("product_view", { productId: product.id, value: product.price });
  }, [product.id, product.price]);

  const sizeAttribute = product.attributes.find(
    (a) => a.name.toLowerCase() === "size"
  );
  const sizeSelected = sizeAttribute ? selections[sizeAttribute.name] : undefined;
  const variantLabel = Object.entries(selections)
    .filter(([name]) => name !== sizeAttribute?.name)
    .map(([, value]) => value)
    .join(" / ");

  const thumbnails = product.images.slice(1, 3);

  const dispatch = useAppDispatch();

  const notifyAddTocart = () => {
    dispatch(
      addItem({
        item: {
          productId: product.id,
          variantId: matchedVariant?.id,
          slug: product.slug,
          name: product.name,
          image: activeImage || product.images[0],
          price: activePrice,
          variantLabel: [variantLabel, sizeSelected].filter(Boolean).join(" / ") || undefined,
          maxStock: activeStock,
        },
        quantity: qualitySelected,
      })
    );
    trackEvent("add_to_cart", { productId: product.id, value: activePrice * qualitySelected });
    toast.custom(
      (t) => (
        <NotifyAddTocart
          product={product}
          qualitySelected={qualitySelected}
          show={t.visible}
          sizeSelected={sizeSelected}
          variantLabel={variantLabel}
        />
      ),
      { position: "top-right", id: "nc-product-notify", duration: 3000 }
    );
  };

  const renderAttributes = () => {
    return product.attributes.map((attribute) => {
      if (attribute.name.toLowerCase() === "size") return null;
      return (
        <div key={attribute.id}>
          <label htmlFor="">
            <span className="text-sm font-medium">
              {attribute.name}:
              <span className="ml-1 font-semibold">{selections[attribute.name]}</span>
            </span>
          </label>
          <div className="flex flex-wrap gap-2 mt-3">
            {attribute.values.map((value, index) => {
              const label = typeof value === "string" ? value : value.label;
              const hex = typeof value === "string" ? undefined : value.hex;
              const isActive = selections[attribute.name] === label;
              return (
                <div
                  key={index}
                  onClick={() => selectAttribute(attribute.name, label)}
                  title={label}
                  className={`relative flex-shrink-0 w-11 h-11 rounded-full border-2 cursor-pointer flex items-center justify-center ${
                    isActive
                      ? "border-primary-6000 dark:border-primary-500"
                      : "border-transparent"
                  }`}
                >
                  {attribute.type === "color" ? (
                    <div
                      className="absolute inset-0.5 rounded-full"
                      style={{ backgroundColor: hex || "#94a3b8" }}
                    ></div>
                  ) : (
                    <span className="text-xs font-medium">{label}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  const renderSizeList = () => {
    if (!sizeAttribute) return null;
    return (
      <div>
        <div className="flex justify-between font-medium text-sm">
          <label htmlFor="">
            <span className="">
              Size:
              <span className="ml-1 font-semibold">{sizeSelected}</span>
            </span>
          </label>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 mt-3">
          {sizeAttribute.values.map((value, index) => {
            const size = typeof value === "string" ? value : value.label;
            const isActive = size === sizeSelected;
            const sizeOutOfStock =
              product.hasVariants &&
              !variants.some(
                (v) => v.attributeSelections[sizeAttribute.name] === size && v.stock > 0
              );
            return (
              <div
                key={index}
                className={`relative h-10 sm:h-11 rounded-2xl border flex items-center justify-center
                text-sm sm:text-base uppercase font-semibold select-none overflow-hidden z-0 ${
                  sizeOutOfStock
                    ? "text-opacity-20 dark:text-opacity-20 cursor-not-allowed"
                    : "cursor-pointer"
                } ${
                  isActive
                    ? "bg-primary-6000 border-primary-6000 text-white hover:bg-primary-6000"
                    : "border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                }`}
                onClick={() => {
                  if (sizeOutOfStock) return;
                  selectAttribute(sizeAttribute.name, size);
                }}
              >
                {size}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSectionContent = () => {
    return (
      <div className="space-y-7 2xl:space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">{product.name}</h2>

          <div className="flex items-center mt-5 space-x-4 sm:space-x-5">
            <Prices
              contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold"
              price={activePrice}
            />

            <div className="h-7 border-l border-slate-300 dark:border-slate-700"></div>

            <div className="flex items-center">
              <a href="#reviews" className="flex items-center text-sm font-medium">
                <StarIcon className="w-5 h-5 pb-[1px] text-yellow-400" />
                <div className="ml-1.5 flex">
                  <span>{product.rating ? product.rating.toFixed(1) : "New"}</span>
                  <span className="block mx-2">·</span>
                  <span className="text-slate-600 dark:text-slate-400 underline">
                    {product.numberOfReviews || 0} reviews
                  </span>
                </div>
              </a>
              {isOutOfStock && (
                <>
                  <span className="hidden sm:block mx-2.5">·</span>
                  <span className="hidden sm:block text-sm text-red-600">Sold out</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">{renderAttributes()}</div>
        <div className="">{renderSizeList()}</div>

        <div className="flex space-x-3.5">
          <div className="flex items-center justify-center bg-slate-100/70 dark:bg-slate-800/70 px-2 py-3 sm:p-3.5 rounded-full">
            <NcInputNumber
              defaultValue={qualitySelected}
              onChange={setQualitySelected}
              max={isOutOfStock ? 1 : undefined}
            />
          </div>
          <ButtonPrimary
            className="flex-1 flex-shrink-0"
            onClick={notifyAddTocart}
            disabled={isOutOfStock}
          >
            <BagIcon className="hidden sm:inline-block w-5 h-5 mb-0.5" />
            <span className="ml-3">{isOutOfStock ? "Sold out" : "Add to cart"}</span>
          </ButtonPrimary>
        </div>

        <hr className=" 2xl:!my-10 border-slate-200 dark:border-slate-700"></hr>

        <AccordionInfo
          data={[
            { name: "Description", content: product.description },
            {
              name: "Fabric + Care",
              content: `<ul class="list-disc list-inside leading-7">
            <li>Made from a sheer Belgian power micromesh.</li>
            <li>74% Polyamide (Nylon) 26% Elastane (Spandex)</li>
            <li>Hand wash in cold water, dry flat</li>
          </ul>`,
            },
          ]}
        />

        <div className="hidden xl:block">
          <Policy />
        </div>
      </div>
    );
  };

  const renderReviews = () => {
    return (
      <div id="reviews">
        <h2 className="text-2xl font-semibold flex items-center">
          <StarIcon className="w-7 h-7 mb-0.5" />
          <span className="ml-1.5">
            {" "}
            {product.rating ? product.rating.toFixed(1) : "New"} ·{" "}
            {product.numberOfReviews || 0} Reviews
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
                    date: review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString()
                      : "",
                    comment: review.comment,
                    starPoint: review.rating,
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">
              No reviews yet for this product.
            </p>
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
    );
  };

  return (
    <div className={`nc-ProductDetailPage `}>
      <main className="container mt-5 lg:mt-11">
        <div className="lg:flex">
          <div className="w-full lg:w-[55%] ">
            <div className="relative">
              <ProductGallery activeImage={activeImage} thumbnails={thumbnails} alt={product.name} />
              <ProductStatus status={product.badge} />
              <LikeButton productId={product.id} className="absolute right-3 top-3 " />
              <CompareButton productId={product.id} className="absolute right-3 top-16" />
            </div>
          </div>

          <div className="w-full lg:w-[45%] pt-10 lg:pt-0 lg:pl-7 xl:pl-9 2xl:pl-10">
            {renderSectionContent()}
          </div>
        </div>

        <div className="mt-12 sm:mt-16 space-y-10 sm:space-y-16">
          <div className="block xl:hidden">
            <Policy />
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          {renderReviews()}

          <hr className="border-slate-200 dark:border-slate-700" />

          <SectionSliderProductCard
            heading="Customers also purchased"
            subHeading=""
            headingFontClassName="text-2xl font-semibold"
            headingClassName="mb-10 text-neutral-900 dark:text-neutral-50"
            data={relatedProducts.length ? relatedProducts : undefined}
            productCardSettings={productCardSettings}
          />

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

          <div className="pb-20 xl:pb-28 lg:pt-14">
            <SectionPromo2 />
          </div>
        </div>
      </main>

      <ModalViewAllReviews
        show={isOpenModalViewAllReviews}
        onCloseModalViewAllReviews={() => setIsOpenModalViewAllReviews(false)}
        reviews={reviews}
        rating={product.rating}
      />
    </div>
  );
};

export default ProductDetailClient;
