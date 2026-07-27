import React, { FC } from "react";

export interface PricesProps {
  className?: string;
  price?: number;
  compareAtPrice?: number;
  contentClass?: string;
}

const Prices: FC<PricesProps> = ({
  className = "",
  price = 33,
  compareAtPrice,
  contentClass = "py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium",
}) => {
  return (
    <div className={`${className}`}>
      <div
        className={`flex items-center border-2 border-green-500 rounded-lg ${contentClass}`}
      >
        <span className="text-green-500 !leading-none">${String(price)}</span>
        {compareAtPrice && compareAtPrice > price && (
          <span className="ml-2 text-sm text-neutral-400 line-through">
            ${String(compareAtPrice)}
          </span>
        )}
      </div>
    </div>
  );
};

export default Prices;
