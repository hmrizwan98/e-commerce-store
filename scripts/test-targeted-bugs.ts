/**
 * Targeted fixes (2026-11-18): product image slider on every product-page design, and the
 * product create flow (real result, no duplicate submits, success navigation).
 * Run: npx tsx --require ./scripts/stub-server-only.cjs --test scripts/test-targeted-bugs.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ProductGallery from "../src/components/theme/variants/product-detail/ProductGallery";
import {
  productSaveError,
  ProductInputError,
  PRODUCT_SAVE_FAILED,
  duplicateSlugMessage,
  isNextControlFlowError,
} from "../src/lib/products/product-save";

const read = (p: string) => fs.readFileSync(p, "utf8");
// Local paths: next/image config (remote hosts) is not loaded in a plain node test.
const imgs = ["/images/a.jpg", "/images/b.jpg", "/images/c.jpg"];

test("slider renders arrows, counter and one thumbnail per image (multi-image product)", () => {
  const html = renderToStaticMarkup(
    React.createElement(ProductGallery, { layout: "thumbnails", images: imgs, activeImage: imgs[0], thumbnails: imgs.slice(1, 3), alt: "Bucket" })
  );
  assert.match(html, /aria-label="Previous image"/);
  assert.match(html, /aria-label="Next image"/);
  assert.equal((html.match(/aria-label="Show image \d+ of 3"/g) ?? []).length, 3);
  assert.match(html.replace(/<!-- -->/g, ""), />1 \/ 3</, "image counter");
});

test("single-image product: no arrows/thumbnails (nothing to browse)", () => {
  const html = renderToStaticMarkup(
    React.createElement(ProductGallery, { layout: "thumbnails", images: [imgs[0]], activeImage: imgs[0], thumbnails: [], alt: "x" })
  );
  assert.doesNotMatch(html, /Next image|Show image/);
});

test("variant image not in the product images is still shown first", () => {
  const variantImg = "/images/variant.jpg";
  const html = renderToStaticMarkup(
    React.createElement(ProductGallery, { layout: "thumbnails", images: imgs, activeImage: variantImg, thumbnails: [], alt: "x" })
  );
  assert.equal((html.match(/Show image \d+ of 4/g) ?? []).length, 4);
});

test("EVERY product-page design uses the slider (it was only wired into Luxury)", () => {
  for (const f of [
    "src/components/theme/variants/product-detail/LuxuryProductDetail.tsx",
    "src/components/theme/variants/product-detail/MinimalProductDetail.tsx",
    "src/components/theme/variants/product-detail/BoldProductDetail.tsx",
    "src/app/product/[slug]/ProductDetailClient.tsx",
  ]) {
    const s = read(f);
    const calls = s.match(/<ProductGallery[\s\S]*?\/>/g) ?? [];
    assert.ok(calls.length >= 1, f);
    for (const c of calls) {
      assert.match(c, /layout="thumbnails"/, f);
      assert.match(c, /images=\{/, f);
    }
  }
});

test("create result: merchant-fixable reasons shown, internals hidden, redirects not swallowed", () => {
  assert.equal(productSaveError(new ProductInputError("Price cannot be negative.")), "Price cannot be negative.");
  assert.equal(productSaveError(new Error("7 PERMISSION_DENIED: internal details")), PRODUCT_SAVE_FAILED);
  assert.equal(productSaveError("weird"), PRODUCT_SAVE_FAILED);
  assert.match(duplicateSlugMessage("steel-bucket"), /"steel-bucket" already exists/);
  assert.equal(isNextControlFlowError({ digest: "NEXT_REDIRECT;replace;/admin/login;307;" }), true);
  assert.equal(isNextControlFlowError({ digest: "NEXT_NOT_FOUND" }), true);
  assert.equal(isNextControlFlowError(new Error("x")), false);
});

test("create flow: one submit at a time, duplicate slugs refused, success toast + product list", () => {
  const actions = read("src/app/(admin)/admin/(protected)/products/actions.ts");
  assert.match(actions, /export async function createProductAction\(input: ProductFormInput\): Promise<ProductSaveResult>/);
  assert.match(actions, /col\.where\("slug", "==", input\.slug\)/);
  assert.match(actions, /d\.data\(\)\.isDeleted !== true/);
  assert.match(actions, /if \(isNextControlFlowError\(err\)\) throw err;/);
  assert.match(actions, /throw new ProductInputError\(`\$\{label\} cannot be negative\.`\)/);
  const form = read("src/app/(admin)/admin/(protected)/products/ProductForm.tsx");
  assert.match(form, /if \(submitLockRef\.current\) return;/);
  assert.match(form, /const res = await createProductAction\(payload\);/);
  assert.match(form, /toast\.success\(`"\$\{payload\.name\}" was created\.`\);\s*router\.push\("\/admin\/products"\);/);
  assert.match(form, /showError\(res\.error\); \/\/ the entered data stays in the form/);
  assert.doesNotMatch(form, /await createProduct\(payload\)/);
  // On success the lock is NOT released before navigation (prevents a second create).
  const success = form.slice(form.indexOf("toast.success(`\"${payload.name}\" was created.`);"), form.indexOf("if (product) {"));
  assert.doesNotMatch(success, /submitLockRef\.current = false|setSubmitting\(false\)/);
});
