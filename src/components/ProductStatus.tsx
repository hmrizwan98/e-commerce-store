import {
  NoSymbolIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { ProductBadge } from "@/types/product";
import React, { FC } from "react";
import IconDiscount from "./IconDiscount";

interface Props {
  status: ProductBadge | undefined;
  className?: string;
}

const BADGE_LABEL: Record<Exclude<ProductBadge, null | undefined>, string> = {
  new: "New in",
  sale: "50% Discount",
  sold_out: "Sold Out",
  limited_edition: "limited edition",
};

const STATUS_BG: Record<Exclude<ProductBadge, null | undefined>, string> = {
  sale: "bg-[var(--badge-sale)] text-white",
  new: "bg-[var(--badge-new)] text-white",
  sold_out: "bg-[var(--badge-out-of-stock)] text-white",
  limited_edition:
    "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300",
};

const ProductStatus: FC<Props> = ({ status, className }) => {
  const renderStatus = () => {
    if (!status) {
      return null;
    }
    const CLASSES = `nc-shadow-lg rounded-full flex items-center justify-center absolute top-3 start-3 px-2.5 py-1.5 text-xs ${
      className ?? STATUS_BG[status]
    }`;
    const label = BADGE_LABEL[status];
    if (status === "new") {
      return (
        <div className={CLASSES}>
          <SparklesIcon className="w-3.5 h-3.5" />
          <span className="ms-1 leading-none">{label}</span>
        </div>
      );
    }
    if (status === "sale") {
      return (
        <div className={CLASSES}>
          <IconDiscount className="w-3.5 h-3.5" />
          <span className="ms-1 leading-none">{label}</span>
        </div>
      );
    }
    if (status === "sold_out") {
      return (
        <div className={CLASSES}>
          <NoSymbolIcon className="w-3.5 h-3.5" />
          <span className="ms-1 leading-none">{label}</span>
        </div>
      );
    }
    if (status === "limited_edition") {
      return (
        <div className={CLASSES}>
          <ClockIcon className="w-3.5 h-3.5" />
          <span className="ms-1 leading-none">{label}</span>
        </div>
      );
    }
    return null;
  };

  return renderStatus();
};

export default ProductStatus;
