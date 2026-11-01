import React from "react";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { verifySessionCookie, isAdminClaim } from "@/lib/firebase/admin-auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/firebase/require-admin";
import { requireCurrentTenant } from "@/lib/tenant/current";
import { getPreviewThemeConfig } from "@/lib/theme/theme-repository";
import { storefrontOriginFromAdminHost } from "@/lib/theme/preview-links";
import { getStorefrontUrl } from "@/lib/platform/tenant-url";
import { getPlatformBaseUrl } from "@/lib/platform/base-url";
import { THEME_PRESETS } from "@/lib/theme/theme-presets";
import { getGeneralSettings, getShippingSettings } from "@/lib/firebase/repositories/site-settings";
import { getProducts, getProductBySlug, getProductVariants, getRelatedProducts } from "@/lib/firebase/repositories/products";
import ThemeProductDetailAdapter from "@/components/theme/ThemeProductDetailAdapter";
import ThemeCartAdapter from "@/components/theme/ThemeCartAdapter";
import HomeContent from "@/app/HomeContent";
import CollectionPageView from "@/components/collection/CollectionPageView";
import ExtraPageSections from "@/components/collection/ExtraPageSections";
import { ThemePreviewModeProvider } from "@/lib/tenant/ThemePreviewModeContext";
import PreviewRuntime from "./PreviewRuntime";
import type { ThemePresetId } from "@/lib/theme/theme-types";

export const dynamic = "force-dynamic";

export interface PreviewPageProps {
  searchParams?: { page?: string; presetId?: string; product?: string };
}

export default async function ThemeCustomizerPreviewPage({ searchParams }: PreviewPageProps) {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const decoded = sessionCookie ? await verifySessionCookie(sessionCookie) : null;
  if (!decoded || !isAdminClaim(decoded)) {
    redirect("/admin/login");
  }

  let tenant;
  try {
    tenant = await requireCurrentTenant();
  } catch {
    redirect("/admin/login");
  }
  if (decoded.tenantId !== tenant.id) {
    redirect("/admin/login");
  }

  const previewSurface = searchParams?.page || "home";
  // Theme Library "Preview" passes ?presetId=... to render a static preset
  // directly, with zero Firestore reads/writes - genuinely non-destructive,
  // unlike the rest of this page which reflects the persisted draft doc.
  const previewPresetId = searchParams?.presetId as ThemePresetId | undefined;
  const staticPreset = previewPresetId ? THEME_PRESETS[previewPresetId] : undefined;

  const [draftFromRepo, general, shipping, products] = await Promise.all([
    // Draft, or the newer unsaved editor changes staged for the preview (never the live theme).
    staticPreset ? Promise.resolve(staticPreset) : getPreviewThemeConfig(),
    getGeneralSettings(),
    getShippingSettings(),
    getProducts(8),
  ]);
  const draft = draftFromRepo;

  // A product clicked inside the preview opens that product (same tenant - the repository is
  // tenant-scoped); otherwise the first product is used as the sample.
  const requestedProduct = previewSurface === "product" && searchParams?.product ? await getProductBySlug(searchParams.product).catch(() => null) : null;
  const sampleProduct = requestedProduct || products[0] || null;
  const sampleVariants = sampleProduct ? await getProductVariants(sampleProduct.id).catch(() => []) : [];
  const sampleRelated = sampleProduct ? await getRelatedProducts(sampleProduct).catch(() => []) : [];

  const h = headers();
  const proto = (h.get("x-forwarded-proto") ?? "https").split(",")[0].trim() === "http" ? "http" : "https";
  const storefrontOrigin =
    storefrontOriginFromAdminHost(h.get("x-forwarded-host") ?? h.get("host"), proto) ?? getStorefrontUrl(tenant, getPlatformBaseUrl());

  const renderSurfaceContent = () => {
    switch (previewSurface) {
      case "collection":
        // The real storefront collection page, rendered with the DRAFT theme.
        return <CollectionPageView theme={draft} searchParams={{}} />;

      case "product":
        if (!sampleProduct) {
          return (
            <div className="container py-20 text-center text-slate-500">
              No products found in database to preview product detail layout.
            </div>
          );
        }
        return (
          <>
            <ThemeProductDetailAdapter
            product={sampleProduct}
            variants={sampleVariants}
            relatedProducts={sampleRelated}
            reviews={[]}
            crossSellProducts={[]}
            upsellProducts={[]}
            productCardSettings={draft.productCard}
            productDetailSettings={draft.productDetail}
            />
            <ExtraPageSections sections={draft.productDetail?.sections} theme={draft} />
          </>
        );

      case "cart":
        return (
          <ThemeCartAdapter
            shippingFlatRate={shipping.flatRate}
            freeShippingThreshold={shipping.freeShippingThreshold}
            taxRatePercent={general.taxRatePercent}
            taxInclusive={general.taxInclusive}
            cartSettings={draft.cart}
          />
        );

      case "home":
      default:
        return <HomeContent themeConfig={draft} />;
    }
  };

  return (
    <ThemePreviewModeProvider>
      <PreviewRuntime
        initialTheme={draft}
        storeName={general.storeName}
        socialLinks={general.socialLinks}
        tenantId={tenant.id}
        storefrontOrigin={storefrontOrigin}
      >
        {renderSurfaceContent()}
      </PreviewRuntime>
    </ThemePreviewModeProvider>
  );
}
