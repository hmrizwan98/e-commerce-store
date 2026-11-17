/**
 * Product page data helpers: colour swatches/names and the product info sections.
 * Run: npx tsx --test scripts/test-product-page.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { colorSwatch, hexForColorName, nameForHex, parseColorLine } from "../src/lib/products/color-swatch";
import { productInfoSections } from "../src/lib/products/product-info";
import type { Product } from "../src/types/product";

test("a colour saved as just a hex code shows a real name and a real swatch (the Zyvora 'Black: #000000' bug)", () => {
  assert.deepEqual(colorSwatch({ label: "#000000" }), { name: "Black", hex: "#000000" });
  assert.deepEqual(colorSwatch("#fff"), { name: "White", hex: "#ffffff" });
  assert.deepEqual(colorSwatch({ label: "Midnight", hex: "#101820" }), { name: "Midnight", hex: "#101820" });
  assert.deepEqual(colorSwatch({ label: "Navy Blue" }), { name: "Navy Blue", hex: "#1e3a8a" });
  assert.deepEqual(colorSwatch({ label: "Unobtainium" }), { name: "Unobtainium", hex: null });
});

test("unknown hex codes are shown as the code, never an invented colour name", () => {
  assert.equal(nameForHex("#7b2d9f"), "#7B2D9F");
  assert.equal(nameForHex("#030303"), "Black"); // clearly black
  assert.equal(hexForColorName(""), null);
});

test("product form colour lines are saved with a label AND a hex", () => {
  assert.deepEqual(parseColorLine("#000000"), { label: "Black", hex: "#000000" });
  assert.deepEqual(parseColorLine("Black|#111111"), { label: "Black", hex: "#111111" });
  assert.deepEqual(parseColorLine("Jet Black #0A0A0A"), { label: "Jet Black", hex: "#0a0a0a" });
  assert.deepEqual(parseColorLine("Red"), { label: "Red", hex: "#ef4444" });
  assert.deepEqual(parseColorLine("Mystery"), { label: "Mystery", hex: undefined });
  assert.deepEqual(parseColorLine("#abc|"), { label: nameForHex("#abc"), hex: "#aabbcc" });
});

const product = (over: Partial<Product>): Pick<Product, "description" | "sku" | "attributes"> => ({
  description: "<p>Great belt</p>",
  sku: "",
  attributes: [],
  ...over,
});

test("product info: only the product's own data - no hard-coded 'Fabric + Care'", () => {
  const sections = productInfoSections(
    product({
      sku: "SB-01",
      attributes: [
        { id: "a", name: "Black", type: "color", values: [{ label: "#000000" }] },
        { id: "b", name: "Material", type: "text", values: ["Neoprene <b>"] },
      ] as Product["attributes"],
    })
  );
  assert.deepEqual(sections.map((s) => s.name), ["Description", "Product details"]);
  const details = sections[1].content;
  assert.match(details, /Colours:<\/span> Black/);
  assert.match(details, /Material:<\/span> Neoprene &lt;b&gt;/); // escaped
  assert.match(details, /SKU:<\/span> SB-01/);
  assert.doesNotMatch(JSON.stringify(sections), /Belgian|Polyamide|micromesh/);
});

test("product info: nothing to show -> no empty sections", () => {
  assert.deepEqual(productInfoSections(product({ description: "  " })), []);
  assert.deepEqual(productInfoSections(product({})).map((s) => s.name), ["Description"]);
});
