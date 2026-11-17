"use client";

import React from "react";
import { colorSwatch, hexForColorName, isHexColor } from "@/lib/products/color-swatch";
import type { Product } from "@/types/product";

export interface AttributeSwatchesProps {
  product: Product;
  selections: Record<string, string>;
  selectAttribute: (name: string, value: string) => void;
  skipAttributeName?: string;
}

/** A colour attribute named after a colour itself (e.g. "Black") reads as "Colour". */
function attributeHeading(name: string, type: string): string {
  if (type === "color" && (hexForColorName(name) || isHexColor(name))) return "Colour";
  return name;
}

/** Renders every non-size attribute's options, delegating selection to the authoritative useProductOptions().selectAttribute - never a second selection mechanism. */
export default function AttributeSwatches({ product, selections, selectAttribute, skipAttributeName }: AttributeSwatchesProps) {
  return (
    <>
      {product.attributes.map((attribute) => {
        if (skipAttributeName && attribute.name.toLowerCase() === skipAttributeName.toLowerCase()) return null;
        const isColor = attribute.type === "color";
        const selected = selections[attribute.name];
        const selectedName = selected ? (isColor ? colorSwatch(selected).name : selected) : undefined;
        return (
          <div key={attribute.id}>
            <p className="text-sm text-[var(--muted,#64748b)]">
              {attributeHeading(attribute.name, attribute.type)}
              {selectedName && <span className="ml-1.5 font-semibold text-[var(--heading,#0f172a)]">{selectedName}</span>}
            </p>
            <div className="flex flex-wrap gap-3 mt-3" role="radiogroup" aria-label={attributeHeading(attribute.name, attribute.type)}>
              {attribute.values.map((value, index) => {
                const label = typeof value === "string" ? value : value.label;
                const isActive = selected === label;
                if (isColor) {
                  const swatch = colorSwatch(value);
                  return (
                    <button
                      key={index}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => selectAttribute(attribute.name, label)}
                      title={swatch.name}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <span
                        className={`w-9 h-9 rounded-full border border-black/10 ring-offset-2 ring-offset-[var(--background,#fff)] transition ${
                          isActive ? "ring-2 ring-[var(--heading,#0f172a)]" : "group-hover:ring-1 group-hover:ring-[var(--border,#e2e8f0)]"
                        }`}
                        style={{ backgroundColor: swatch.hex ?? "#e5e7eb" }}
                      />
                      <span className={`text-[11px] ${isActive ? "font-semibold text-[var(--heading,#0f172a)]" : "text-[var(--muted,#64748b)]"}`}>
                        {swatch.name}
                      </span>
                    </button>
                  );
                }
                return (
                  <button
                    key={index}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => selectAttribute(attribute.name, label)}
                    className={`min-w-[3rem] px-4 py-2 rounded-full border text-sm transition ${
                      isActive
                        ? "bg-[var(--heading,#0f172a)] border-[var(--heading,#0f172a)] text-[var(--background,#fff)]"
                        : "border-[var(--border,#e2e8f0)] text-[var(--heading,#0f172a)] hover:border-[var(--heading,#0f172a)]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
