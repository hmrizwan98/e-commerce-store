import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProductVariants,
  getRelatedProducts,
  getProductsByIds,
} from "@/lib/firebase/repositories/products";
import { getApprovedReviewsByProduct } from "@/lib/firebase/repositories/reviews";
import { getActiveThemeConfig } from "@/lib/theme/theme-repository";
import ThemeProductDetailAdapter from "@/components/theme/ThemeProductDetailAdapter";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product || product.isDeleted || product.status !== "active") {
    return { title: "Product Not Found" };
  }

  const title = product.name;
  const description = product.description
    ? product.description.replace(/<[^>]*>?/gm, "").slice(0, 160)
    : `Buy ${product.name} at the best price. Quality guaranteed.`;
  const image = product.images?.[0];

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const [variants, relatedProducts, reviews, crossSellProducts, upsellProducts, theme] = await Promise.all([
    getProductVariants(product.id),
    getRelatedProducts(product),
    getApprovedReviewsByProduct(product.id, 6),
    getProductsByIds(product.crossSellProductIds ?? []),
    getProductsByIds(product.upsellProductIds ?? []),
    getActiveThemeConfig(),
  ]);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images || [],
    description: product.description ? product.description.replace(/<[^>]*>?/gm, "").slice(0, 160) : product.name,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "PKR",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ThemeProductDetailAdapter
        product={product}
        variants={variants}
        relatedProducts={relatedProducts}
        reviews={reviews}
        crossSellProducts={crossSellProducts}
        upsellProducts={upsellProducts}
        productCardSettings={theme.productCard}
        productDetailSettings={theme.productDetail}
      />
    </>
  );
}
