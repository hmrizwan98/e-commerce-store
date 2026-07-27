import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProductVariants,
  getRelatedProducts,
  getProductsByIds,
} from "@/lib/firebase/repositories/products";
import { getApprovedReviewsByProduct } from "@/lib/firebase/repositories/reviews";
import ProductDetailClient from "./ProductDetailClient";

// Firestore is read at request time (Admin SDK) rather than at build time -
// see src/app/page.tsx for the same pattern established in Phase 1.
export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const [variants, relatedProducts, reviews, crossSellProducts, upsellProducts] = await Promise.all([
    getProductVariants(product.id),
    getRelatedProducts(product),
    getApprovedReviewsByProduct(product.id, 6),
    getProductsByIds(product.crossSellProductIds ?? []),
    getProductsByIds(product.upsellProductIds ?? []),
  ]);

  return (
    <ProductDetailClient
      product={product}
      variants={variants}
      relatedProducts={relatedProducts}
      reviews={reviews}
      crossSellProducts={crossSellProducts}
      upsellProducts={upsellProducts}
    />
  );
}
