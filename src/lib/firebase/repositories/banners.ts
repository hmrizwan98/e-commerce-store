import "server-only";
import { tenantCollection } from "../tenant-scope";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { Banner, BannerPlacement } from "@/types/banner";

const COLLECTION = "banners";

export async function getBannersByPlacement(
  placement: BannerPlacement
): Promise<Banner[]> {
  return safeQuery("getBannersByPlacement", [], async () => {
    const snap = await (await tenantCollection(COLLECTION))
      .where("placement", "==", placement)
      .where("isActive", "==", true)
      .orderBy("order", "asc")
      .get();

    return snap.docs
      .map((doc) => docData<Banner>(doc))
      .filter((b): b is Banner => b !== null);
  });
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
