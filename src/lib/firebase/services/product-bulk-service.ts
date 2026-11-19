import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { slugify } from "@/lib/utils/slugify";
import type {
  ProductBulkOperation,
  ProductBulkOperationType,
  BulkImportProductItem,
  BulkImportResult,
  BulkExportResult,
} from "@/types/product-bulk-operation";

export async function recordProductBulkOperation(
  type: ProductBulkOperationType,
  opts?: {
    status?: ProductBulkOperation["status"];
    fileName?: string;
    rowCount?: number;
    note?: string;
  }
): Promise<string> {
  const col = await tenantCollection("productBulkOperations");
  const ref = col.doc();
  await ref.set({
    type,
    status: opts?.status ?? ("queued" satisfies ProductBulkOperation["status"]),
    ...(opts?.fileName ? { fileName: opts.fileName } : {}),
    ...(typeof opts?.rowCount === "number" ? { rowCount: opts.rowCount } : {}),
    ...(opts?.note ? { note: opts.note } : {}),
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function queueProductExport(note?: string): Promise<string> {
  return recordProductBulkOperation("export", { status: "queued", note });
}

export async function queueProductImport(fileName?: string, note?: string): Promise<string> {
  return recordProductBulkOperation("import", { status: "queued", fileName, note });
}

export async function executeProductBulkImport(
  items: BulkImportProductItem[],
  fileName?: string
): Promise<BulkImportResult> {
  if (!items.length) {
    return { success: false, importedCount: 0, errors: ["No products found in file."] };
  }

  const prodCol = await tenantCollection("products");
  const catCol = await tenantCollection("categories");

  // 1. Preload existing categories for name-to-id resolution
  const catSnap = await catCol.where("isDeleted", "==", false).get();
  const categoryMap = new Map<string, string>();
  for (const doc of catSnap.docs) {
    const data = doc.data();
    if (data.name) {
      categoryMap.set(data.name.trim().toLowerCase(), doc.id);
    }
  }

  // 2. Preload existing product slugs to prevent collisions
  const existingSlugsSnap = await prodCol.select("slug").get();
  const usedSlugs = new Set<string>();
  for (const doc of existingSlugsSnap.docs) {
    const s = doc.data().slug;
    if (s) usedSlugs.add(s);
  }

  const errors: string[] = [];
  const preparedDocs: any[] = [];

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const rawName = item.name ? String(item.name).trim() : "";
    if (!rawName) {
      errors.push(`Row ${idx + 1}: Product name is required.`);
      continue;
    }

    const price = Math.max(0, Number(item.price) || 0);
    const compareAtPrice =
      typeof item.compareAtPrice === "number" && !isNaN(item.compareAtPrice) && item.compareAtPrice > 0
        ? item.compareAtPrice
        : undefined;

    // Generate unique slug
    let baseSlug = slugify(rawName) || "product";
    let candidateSlug = baseSlug;
    let counter = 2;
    while (usedSlugs.has(candidateSlug)) {
      candidateSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    usedSlugs.add(candidateSlug);

    // Resolve Category
    const categoryIds: string[] = [];
    if (item.category) {
      const catNames = String(item.category)
        .split(/[,;|]/)
        .map((c) => c.trim())
        .filter(Boolean);

      for (const catName of catNames) {
        const lower = catName.toLowerCase();
        let catId = categoryMap.get(lower);
        if (!catId) {
          // Auto-create category so products don't end up uncategorized
          const newCatRef = catCol.doc();
          const newCatSlug = slugify(catName) || `cat-${Date.now()}`;
          await newCatRef.set({
            name: catName,
            slug: newCatSlug,
            isActive: true,
            isDeleted: false,
            order: 0,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          catId = newCatRef.id;
          categoryMap.set(lower, catId);
        }
        if (!categoryIds.includes(catId)) {
          categoryIds.push(catId);
        }
      }
    }

    // Facets & search tags
    const nameLower = rawName.toLowerCase();
    const tags = Array.from(
      new Set(
        nameLower
          .split(/[\s,.-]+/)
          .map((w) => w.trim())
          .filter((w) => w.length >= 2)
      )
    );

    const docRef = prodCol.doc();
    preparedDocs.push({
      id: docRef.id,
      name: rawName,
      slug: candidateSlug,
      description: item.description ? String(item.description).trim() : "",
      price,
      ...(compareAtPrice !== undefined ? { compareAtPrice } : {}),
      ...(item.sku ? { sku: String(item.sku).trim() } : {}),
      stock: typeof item.stock === "number" ? Math.max(0, Math.floor(item.stock)) : 0,
      trackInventory: true,
      categoryIds,
      tags,
      images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
      status: item.status === "draft" ? "draft" : "active",
      attributes: [],
      hasVariants: false,
      rating: 0,
      numberOfReviews: 0,
      isDeleted: false,
      deletedAt: null,
      nameLower,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  // 3. Batch write in chunks of 400
  try {
    const BATCH_SIZE = 400;
    for (let i = 0; i < preparedDocs.length; i += BATCH_SIZE) {
      const chunk = preparedDocs.slice(i, i + BATCH_SIZE);
      const batch = prodCol.firestore.batch();
      for (const doc of chunk) {
        const ref = prodCol.doc(doc.id);
        batch.set(ref, doc);
      }
      await batch.commit();
    }

    // 4. Record bulk operation in history
    await recordProductBulkOperation("import", {
      status: preparedDocs.length > 0 ? "completed" : "failed",
      fileName: fileName || "imported-products.csv",
      rowCount: preparedDocs.length,
      note: errors.length ? `${preparedDocs.length} imported, ${errors.length} skipped` : undefined,
    });

    return {
      success: preparedDocs.length > 0,
      importedCount: preparedDocs.length,
      errors,
    };
  } catch (err: any) {
    await recordProductBulkOperation("import", {
      status: "failed",
      fileName: fileName || "imported-products.csv",
      rowCount: 0,
      note: err?.message || "Batch write failed",
    });
    return {
      success: false,
      importedCount: 0,
      errors: [err?.message || "Failed to commit products to database."],
    };
  }
}

export async function executeProductBulkExport(): Promise<BulkExportResult> {
  const prodCol = await tenantCollection("products");
  const catCol = await tenantCollection("categories");

  const [prodSnap, catSnap] = await Promise.all([
    prodCol.where("isDeleted", "==", false).orderBy("createdAt", "desc").get(),
    catCol.where("isDeleted", "==", false).get(),
  ]);

  const catMap = new Map<string, string>();
  for (const doc of catSnap.docs) {
    const data = doc.data();
    if (data.name) {
      catMap.set(doc.id, data.name);
    }
  }

  const headers = [
    "Name",
    "Price",
    "CompareAtPrice",
    "SKU",
    "Stock",
    "Category",
    "Description",
    "Images",
    "Status",
  ];

  const rows: (string | number)[][] = [];
  for (const doc of prodSnap.docs) {
    const p = doc.data();
    const categories = (p.categoryIds || [])
      .map((id: string) => catMap.get(id))
      .filter(Boolean)
      .join(", ");
    const images = Array.isArray(p.images) ? p.images.join(", ") : "";

    rows.push([
      p.name || "",
      p.price ?? 0,
      p.compareAtPrice ?? "",
      p.sku || "",
      p.stock ?? 0,
      categories,
      p.description || "",
      images,
      p.status || "active",
    ]);
  }

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const filename = `products-export-${dateStr}`;

  await recordProductBulkOperation("export", {
    status: "completed",
    fileName: `${filename}.csv`,
    rowCount: rows.length,
  });

  return {
    filename,
    headers,
    rows,
    count: rows.length,
  };
}
