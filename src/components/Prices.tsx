import React, { FC } from "react";

export interface PricesProps {
  className?: string;
  price?: number;
  compareAtPrice?: number;
  contentClass?: string;
}

const Prices: FC<PricesProps> = ({
  className = "",
  price = 0,
  compareAtPrice,
  contentClass = "text-base font-bold text-[var(--heading,#0f172a)] dark:text-white",
}) => {
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className={contentClass}>${String(price)}</span>
      {compareAtPrice && compareAtPrice > price && (
        <span className="text-xs text-slate-400 dark:text-neutral-500 line-through font-normal">
          ${String(compareAtPrice)}
        </span>
      )}
    </div>
  );
};

export default Prices;
