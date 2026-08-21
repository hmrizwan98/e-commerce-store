import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionCookie, isAdminClaim } from "@/lib/firebase/admin-auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/firebase/require-admin";
import { requireCurrentTenant } from "@/lib/tenant/current";
import { getDraftThemeConfig } from "@/lib/theme/theme-repository";
import { THEME_PRESETS } from "@/lib/theme/theme-presets";
import { getGeneralSettings, getShippingSettings } from "@/lib/firebase/repositories/site-settings";
import { getProducts, getProductVariants, getRelatedProducts } from "@/lib/firebase/repositories/products";
import ThemeAnnouncementBarAdapter from "@/components/theme/ThemeAnnouncementBarAdapter";
import ThemeHeaderAdapter from "@/components/theme/ThemeHeaderAdapter";
import ThemeFooterAdapter from "@/components/theme/ThemeFooterAdapter";
import ThemePopupModal from "@/components/theme/ThemePopupModal";
import ThemeProductCardAdapter from "@/components/theme/ThemeProductCardAdapter";
import ThemeProductDetailAdapter from "@/components/theme/ThemeProductDetailAdapter";
import ThemeCartAdapter from "@/components/theme/ThemeCartAdapter";
import HomeContent from "@/app/HomeContent";
import { ThemePreviewModeProvider } from "@/lib/tenant/ThemePreviewModeContext";
import ThemePreviewStyleSync from "./ThemePreviewStyleSync";
import type { ThemePresetId } from "@/lib/theme/theme-types";

export const dynamic = "force-dynamic";

export interface PreviewPageProps {
  searchParams?: { page?: string; presetId?: string };
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
    staticPreset ? Promise.resolve(staticPreset) : getDraftThemeConfig(),
    getGeneralSettings(),
    getShippingSettings(),
    getProducts(8),
  ]);
  const draft = draftFromRepo;

  const sampleProduct = products[0] || null;
  const sampleVariants = sampleProduct ? await getProductVariants(sampleProduct.id).catch(() => []) : [];
  const sampleRelated = sampleProduct ? await getRelatedProducts(sampleProduct).catch(() => []) : [];

  const renderSurfaceContent = () => {
    switch (previewSurface) {
      case "collection":
        return (
          <div className="container py-12 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--heading)]">Collection Preview</h1>
              <p className="text-sm text-[var(--muted)] mt-1">Previewing product grid layout and product card tokens.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ThemeProductCardAdapter key={p.id} data={p} productCardSettings={draft.productCard} />
              ))}
            </div>
          </div>
        );

      case "product":
        if (!sampleProduct) {
          return (
            <div className="container py-20 text-center text-slate-500">
              No products found in database to preview product detail layout.
            </div>
          );
        }
        return (
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
      <ThemePreviewStyleSync initialTheme={draft} />
      <ThemeAnnouncementBarAdapter announcementSettings={draft.announcementBar} topBar={draft.header?.topBar} />
      <ThemeHeaderAdapter headerSettings={draft.header} cartSettings={draft.cart} />
      <main className="min-h-[60vh]">{renderSurfaceContent()}</main>
      <ThemeFooterAdapter footerSettings={draft.footer} storeName={general.storeName} />
      <ThemePopupModal popupConfig={draft.popup} tenantId={tenant.id} themePresetId={draft.presetId} />
    </ThemePreviewModeProvider>
  );
}
