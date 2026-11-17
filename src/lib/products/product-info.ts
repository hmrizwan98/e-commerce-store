import { colorSwatch } from "./color-swatch";
import type { Product } from "@/types/product";

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

/**
 * Info sections for a product page, built ONLY from the product's own data: its description,
 * then "Product details" (SKU and attribute options) when there is any. Replaces the old
 * hard-coded "Fabric + Care" text ("Belgian power micromesh…") that every product showed.
 * Description HTML comes from the admin's rich-text editor (as before); everything else is escaped.
 */
export function productInfoSections(product: Pick<Product, "description" | "sku" | "attributes">): { name: string; content: string }[] {
  const sections: { name: string; content: string }[] = [];
  if (product.description?.trim()) sections.push({ name: "Description", content: product.description });

  const rows: string[] = [];
  for (const attr of product.attributes ?? []) {
    const values = (attr.values ?? []).map((v) => (attr.type === "color" ? colorSwatch(v).name : typeof v === "string" ? v : v.label)).filter(Boolean);
    if (!values.length) continue;
    const label = attr.type === "color" ? "Colours" : attr.name;
    rows.push(`<li><span class="font-medium">${escapeHtml(label)}:</span> ${escapeHtml(values.join(", "))}</li>`);
  }
  if (product.sku?.trim()) rows.push(`<li><span class="font-medium">SKU:</span> ${escapeHtml(product.sku.trim())}</li>`);
  if (rows.length) sections.push({ name: "Product details", content: `<ul class="space-y-1.5">${rows.join("")}</ul>` });
  return sections;
}
