import React, { FC } from "react";

export interface PaymentIconsProps {
  className?: string;
}

const PaymentIcons: FC<PaymentIconsProps> = ({ className = "" }) => {
  return (
    <div className={`nc-PaymentIcons flex items-center gap-3 ${className}`}>
      <svg width="38" height="24" viewBox="0 0 38 24" fill="none" aria-label="Visa">
        <rect width="38" height="24" rx="4" className="fill-neutral-100 dark:fill-neutral-800" />
        <text x="19" y="16" textAnchor="middle" fontSize="9" fontWeight="700" className="fill-neutral-600 dark:fill-neutral-300">
          VISA
        </text>
      </svg>
      <svg width="38" height="24" viewBox="0 0 38 24" fill="none" aria-label="Mastercard">
        <rect width="38" height="24" rx="4" className="fill-neutral-100 dark:fill-neutral-800" />
        <circle cx="16" cy="12" r="6" className="fill-neutral-400 dark:fill-neutral-500" opacity="0.8" />
        <circle cx="22" cy="12" r="6" className="fill-neutral-500 dark:fill-neutral-400" opacity="0.8" />
      </svg>
      <svg width="38" height="24" viewBox="0 0 38 24" fill="none" aria-label="PayPal">
        <rect width="38" height="24" rx="4" className="fill-neutral-100 dark:fill-neutral-800" />
        <text x="19" y="16" textAnchor="middle" fontSize="8" fontWeight="700" className="fill-neutral-600 dark:fill-neutral-300">
          PayPal
        </text>
      </svg>
      <span className="inline-flex items-center px-2 h-6 rounded border border-neutral-200 dark:border-neutral-700 text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
        Cash on Delivery
      </span>
    </div>
  );
};

export default PaymentIcons;
