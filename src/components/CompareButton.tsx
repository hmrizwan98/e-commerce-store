"use client";

import React from "react";
import { ScaleIcon } from "@heroicons/react/24/outline";
import { useCompare } from "@/hooks/useCompare";

export interface CompareButtonProps {
  className?: string;
  productId: string;
}

const CompareButton: React.FC<CompareButtonProps> = ({ className = "", productId }) => {
  const { isComparing, toggle } = useCompare();
  const active = isComparing(productId);

  return (
    <button
      className={`w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 nc-shadow-lg ${
        active ? "text-primary-600" : "text-neutral-700 dark:text-slate-200"
      } ${className}`}
      title="Add to compare"
      onClick={() => toggle(productId)}
    >
      <ScaleIcon className="w-5 h-5" />
    </button>
  );
};

export default CompareButton;
