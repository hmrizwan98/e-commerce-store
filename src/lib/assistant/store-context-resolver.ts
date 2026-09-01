import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { getStoreById } from "@/lib/firebase/repositories/stores";
import type { LiveStoreStats } from "./types";

export async function fetchLiveStoreStats(storeId: string): Promise<LiveStoreStats> {
  try {
    const storeRef = adminDb().collection("stores").doc(storeId);
    const storeDoc = await getStoreById(storeId);

    // Perform parallel count queries where supported, fallback to snapshot size with limit(500)
    const [
      productsSnap,
      categoriesSnap,
      homepageSnap,
      ordersSnap,
      pendingOrdersSnap,
      pendingProductsSnap,
      customersSnap,
    ] = await Promise.all([
      storeRef.collection("products").where("isDeleted", "!=", true).count().get().catch(async () => {
        const snap = await storeRef.collection("products").limit(500).get();
        return { data: () => ({ count: snap.size }) };
      }),
      storeRef.collection("categories").where("isDeleted", "!=", true).count().get().catch(async () => {
        const snap = await storeRef.collection("categories").limit(500).get();
        return { data: () => ({ count: snap.size }) };
      }),
      storeRef.collection("homepageSections").where("isActive", "==", true).count().get().catch(async () => {
        const snap = await storeRef.collection("homepageSections").limit(100).get();
        return { data: () => ({ count: snap.size }) };
      }),
      storeRef.collection("orders").count().get().catch(async () => {
        const snap = await storeRef.collection("orders").limit(500).get();
        return { data: () => ({ count: snap.size }) };
      }),
      storeRef.collection("orders").limit(500).get().then((snap) => {
        const pendingCount = snap.docs.filter((d) => {
          const st = (d.data().orderStatus || d.data().status || "").toString().toLowerCase();
          return st === "pending";
        }).length;
        return { data: () => ({ count: pendingCount }) };
      }).catch(() => ({ data: () => ({ count: 0 }) })),
      storeRef.collection("products").where("status", "==", "draft").count().get().catch(async () => {
        const snap = await storeRef.collection("products").where("status", "==", "draft").limit(100).get();
        return { data: () => ({ count: snap.size }) };
      }),
      storeRef.collection("customers").count().get().catch(async () => {
        const snap = await storeRef.collection("customers").limit(500).get();
        return { data: () => ({ count: snap.size }) };
      }),
    ]);

    const productCount = productsSnap.data().count ?? 0;
    const categoryCount = categoriesSnap.data().count ?? 0;
    const homepageSectionCount = homepageSnap.data().count ?? 0;
    const orderCount = ordersSnap.data().count ?? 0;
    const pendingOrderCount = pendingOrdersSnap.data().count ?? 0;
    const pendingProductCount = pendingProductsSnap.data().count ?? 0;
    const customerCount = customersSnap.data().count ?? 0;

    return {
      productCount,
      categoryCount,
      homepageSectionCount,
      orderCount,
      pendingOrderCount,
      pendingProductCount,
      customerCount,
      activeThemeId: storeDoc?.themeId || "default",
      activeThemeName: storeDoc?.themeId ? storeDoc.themeId.replace(/-/g, " ").toUpperCase() : "Default Theme",
    };
  } catch (err) {
    console.error(`[fetchLiveStoreStats] Error fetching stats for store ${storeId}:`, err);
    return {
      productCount: 0,
      categoryCount: 0,
      homepageSectionCount: 0,
      orderCount: 0,
      pendingOrderCount: 0,
      pendingProductCount: 0,
      customerCount: 0,
      activeThemeId: "default",
      activeThemeName: "Default Theme",
    };
  }
}
