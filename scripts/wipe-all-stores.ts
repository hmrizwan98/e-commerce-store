import dotenv from "dotenv";
import { cert, initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { v2 as cloudinary } from "cloudinary";

dotenv.config({ path: ".env.local" });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase credentials in .env.local");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = getFirestore();
const auth = getAuth();

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const ROOT_COLLECTIONS_TO_CLEAN = [
  "products",
  "categories",
  "orders",
  "coupons",
  "reviews",
  "customers",
  "storeActivityLogs",
  "siteSettings",
  "themes",
  "menus",
  "banners",
  "faqs",
  "testimonials",
  "suppliers",
  "pages",
];

async function deleteCollectionDocs(collectionName: string) {
  let count = 0;
  while (true) {
    const snap = await db.collection(collectionName).limit(500).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    count += snap.docs.length;
    if (snap.docs.length < 500) break;
  }
  return count;
}

async function wipeAllStores() {
  console.log("=== STARTING FULL STORE WIPE ===");

  const storesSnap = await db.collection("stores").get();
  console.log(`Found ${storesSnap.docs.length} stores to delete.`);

  for (const storeDoc of storesSnap.docs) {
    const data = storeDoc.data();
    const storeId = storeDoc.id;
    const slug = data.slug;
    const ownerEmail = data.email;

    console.log(`\nDeleting store: "${data.name || slug}" (ID: ${storeId}, Slug: ${slug})...`);

    // 1. Delete Auth User if exists and not superadmin
    if (ownerEmail && ownerEmail !== "muhammad.rizwan2698@gmail.com") {
      try {
        const userRec = await auth.getUserByEmail(ownerEmail);
        await auth.deleteUser(userRec.uid);
        console.log(`- Deleted Auth User: ${ownerEmail} (${userRec.uid})`);
      } catch (err: any) {
        if (err.code !== "auth/user-not-found") {
          console.warn(`- Failed to delete Auth user ${ownerEmail}:`, err.message);
        }
      }
    }

    // 2. Delete Cloudinary assets for this store slug if configured
    if (slug && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        await cloudinary.api.delete_resources_by_prefix(`${slug}/`);
        await cloudinary.api.delete_folder(slug).catch(() => {});
        console.log(`- Deleted Cloudinary folder/assets for prefix: ${slug}/`);
      } catch (err: any) {
        console.warn(`- Cloudinary cleanup note for ${slug}:`, err.message);
      }
    }

    // 3. Delete Store Doc & subcollections recursively
    try {
      await db.recursiveDelete(storeDoc.ref);
      console.log(`- Recursively deleted store document stores/${storeId}`);
    } catch (err: any) {
      console.error(`- Failed recursive delete for store ${storeId}:`, err.message);
    }
  }

  // 4. Clean root collections
  console.log("\nCleaning root collections...");
  for (const colName of ROOT_COLLECTIONS_TO_CLEAN) {
    const deletedCount = await deleteCollectionDocs(colName);
    if (deletedCount > 0) {
      console.log(`- Deleted ${deletedCount} items from root collection '${colName}'`);
    }
  }

  console.log("\n=== FULL STORE WIPE COMPLETED SUCCESSFULLY ===");
}

wipeAllStores().catch(console.error);
