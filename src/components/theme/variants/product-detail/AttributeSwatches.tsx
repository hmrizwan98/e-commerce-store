"use client";

import React from "react";
import type { Product } from "@/types/product";

export interface AttributeSwatchesProps {
  product: Product;
  selections: Record<string, string>;
  selectAttribute: (name: string, value: string) => void;
  skipAttributeName?: string;
}

/** Renders every non-size attribute's swatches, delegating selection to the authoritative useProductOptions().selectAttribute - never a second selection mechanism. */
export default function AttributeSwatches({ product, selections, selectAttribute, skipAttributeName }: AttributeSwatchesProps) {
  return (
    <>
      {product.attributes.map((attribute) => {
        if (skipAttributeName && attribute.name.toLowerCase() === skipAttributeName.toLowerCase()) return null;
        return (
          <div key={attribute.id}>
            <span className="text-sm font-medium">
              {attribute.name}:<span className="ml-1 font-semibold">{selections[attribute.name]}</span>
            </span>
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
                      isActive ? "border-primary-6000 dark:border-primary-500" : "border-transparent"
                    }`}
                  >
                    {attribute.type === "color" ? (
                      <div className="absolute inset-0.5 rounded-full" style={{ backgroundColor: hex || "#94a3b8" }} />
                    ) : (
                      <span className="text-xs font-medium">{label}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
