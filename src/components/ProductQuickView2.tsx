"use client";
import React, { FC, useState } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import LikeButton from "@/components/LikeButton";
import { StarIcon } from "@heroicons/react/24/solid";
import BagIcon from "@/components/BagIcon";
import NcInputNumber from "@/components/NcInputNumber";
import type { Product } from "@/types/product";
import Prices from "@/components/Prices";
import toast from "react-hot-toast";
import NotifyAddTocart from "./NotifyAddTocart";
import ProductStatus from "@/components/ProductStatus";
import { useProductOptions } from "@/hooks/useProductOptions";
import type { Route } from "@/routers/types";
import Image from "next/image";
import Link from "next/link";

export interface ProductQuickView2Props {
  className?: string;
  product: Product;
}

const ProductQuickView2: FC<ProductQuickView2Props> = ({
  className = "",
  product,
}) => {
  const { name, images, rating, numberOfReviews, badge, slug } = product;
  const { selections, selectAttribute, activePrice } = useProductOptions(product);
  const [qualitySelected, setQualitySelected] = useState(1);
  const productHref = `/product/${slug}` as Route;

  const notifyAddTocart = () => {
    toast.custom(
      (t) => (
        <NotifyAddTocart
          product={product}
          qualitySelected={qualitySelected}
          show={t.visible}
          variantLabel={Object.values(selections).join(" / ")}
        />
      ),
      { position: "top-right", id: "nc-product-notify", duration: 3000 }
    );
  };

  const renderAttributes = () => {
    if (!product.attributes.length) return null;

    return product.attributes.map((attribute) => (
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
            if (attribute.type === "color") {
              return (
                <div
                  key={index}
                  onClick={() => selectAttribute(attribute.name, label)}
                  title={label}
                  className={`relative w-9 h-9 rounded-full border-2 cursor-pointer ${
                    isActive ? "border-primary-6000 dark:border-primary-500" : "border-transparent"
                  }`}
                >
                  <div
                    className="absolute inset-0.5 rounded-full"
                    style={{ backgroundColor: hex || "#94a3b8" }}
                  ></div>
                </div>
              );
            }
            return (
              <div
                key={index}
                onClick={() => selectAttribute(attribute.name, label)}
                className={`h-10 px-4 rounded-2xl border flex items-center justify-center text-sm font-semibold cursor-pointer select-none ${
                  isActive
                    ? "bg-primary-6000 border-primary-6000 text-white"
                    : "border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                }`}
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  const renderSectionContent = () => {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl 2xl:text-3xl font-semibold">
            <Link href={productHref}>{name}</Link>
          </h2>

          <div className="flex items-center mt-5 space-x-4 sm:space-x-5">
            <Prices
              contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold"
              price={activePrice}
            />

            <div className="h-6 border-l border-slate-300 dark:border-slate-700"></div>

            <div className="flex items-center">
              <Link href={productHref} className="flex items-center text-sm font-medium">
                <StarIcon className="w-5 h-5 pb-[1px] text-yellow-400" />
                <div className="ml-1.5 flex">
                  <span>{rating || "New"}</span>
                  <span className="block mx-2">·</span>
                  <span className="text-slate-600 dark:text-slate-400 underline">
                    {numberOfReviews || 0} reviews
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">{renderAttributes()}</div>

        <div className="flex space-x-3.5">
          <div className="flex items-center justify-center bg-slate-100/70 dark:bg-slate-800/70 px-2 py-3 sm:p-3.5 rounded-full">
            <NcInputNumber
              defaultValue={qualitySelected}
              onChange={setQualitySelected}
            />
          </div>
          <ButtonPrimary
            className="flex-1 flex-shrink-0"
            onClick={notifyAddTocart}
          >
            <BagIcon className="hidden sm:inline-block w-5 h-5 mb-0.5" />
            <span className="ml-3">Add to cart</span>
          </ButtonPrimary>
        </div>

        <hr className=" border-slate-200 dark:border-slate-700"></hr>

        <div className="text-center">
          <Link
            className="text-primary-6000 hover:text-primary-500 font-medium"
            href={productHref}
          >
            View full details
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className={`nc-ProductQuickView2 ${className}`}>
      <div className="lg:flex">
        <div className="w-full lg:w-[50%] ">
          <div className="relative">
            <div className="aspect-w-1 aspect-h-1">
              <Image
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={images[0]}
                className="w-full rounded-xl object-cover"
                alt={name}
              />
            </div>

            <ProductStatus status={badge} />
            <LikeButton productId={product.id} className="absolute right-3 top-3 " />
          </div>
        </div>

        <div className="w-full lg:w-[50%] pt-6 lg:pt-0 lg:pl-7 xl:pl-10">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView2;
