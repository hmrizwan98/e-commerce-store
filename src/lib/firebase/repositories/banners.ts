import "server-only";
import { adminDb } from "../admin";
import { docData } from "./utils";
import type { Banner, BannerPlacement } from "@/types/banner";

const COLLECTION = "banners";

export async function getBannersByPlacement(
  placement: BannerPlacement
): Promise<Banner[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("placement", "==", placement)
    .where("isActive", "==", true)
    .orderBy("order", "asc")
    .get();

  return snap.docs
    .map((doc) => docData<Banner>(doc))
    .filter((b): b is Banner => b !== null);
}

// --- Admin ---

export async function getBannerById(id: string): Promise<Banner | null> {
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  return docData<Banner>(doc);
}

export async function getAllBannersForAdmin(placement?: BannerPlacement): Promise<Banner[]> {
  let query: FirebaseFirestore.Query = adminDb().collection(COLLECTION);
  if (placement) query = query.where("placement", "==", placement);
  const snap = await query.orderBy("order", "asc").get();
  return snap.docs
    .map((doc) => docData<Banner>(doc))
    .filter((b): b is Banner => b !== null);
}
