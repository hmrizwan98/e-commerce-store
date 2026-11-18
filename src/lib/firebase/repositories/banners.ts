import "server-only";
import { tenantCollection } from "../tenant-scope";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { Banner, BannerPlacement } from "@/types/banner";
import { queryLiveBanners } from "./storefront-queries";
import { adminDb } from "../admin";
import { requireCurrentTenant } from "@/lib/tenant/current";

const COLLECTION = "banners";

export async function getBannersByPlacement(placement: BannerPlacement): Promise<Banner[]> {
  const tenant = await requireCurrentTenant();
  return safeQuery("getBannersByPlacement", [], () => queryLiveBanners(adminDb(), tenant.id, placement), [placement]);
}

/** The first live banner in a promo slot, or null - callers render nothing without one. */
export async function getFirstBanner(placement: BannerPlacement): Promise<Banner | null> {
  return (await getBannersByPlacement(placement))[0] ?? null;
}

// --- Admin ---

export async function getBannerById(id: string): Promise<Banner | null> {
  const doc = await (await tenantCollection(COLLECTION)).doc(id).get();
  return docData<Banner>(doc);
}

export async function getAllBannersForAdmin(placement?: BannerPlacement): Promise<Banner[]> {
  return safeQuery("getAllBannersForAdmin", [], async () => {
    let query: FirebaseFirestore.Query = await tenantCollection(COLLECTION);
    if (placement) query = query.where("placement", "==", placement);
    const snap = await query.orderBy("order", "asc").get();
    return snap.docs
      .map((doc) => docData<Banner>(doc))
      .filter((b): b is Banner => b !== null);
  });
}
