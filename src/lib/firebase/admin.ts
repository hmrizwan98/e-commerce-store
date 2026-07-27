import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function loadServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin SDK is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and " +
        "FIREBASE_PRIVATE_KEY in .env.local (see .env.example and the Firebase setup guide in README.md)."
    );
  }

  return { projectId, clientEmail, privateKey };
}

let app: App;

function getAdminApp(): App {
  if (getApps().length) {
    return getApps()[0];
  }
  const serviceAccount = loadServiceAccount();
  app = initializeApp({
    credential: cert(serviceAccount),
  });
  return app;
}

export const adminAuth = () => getAuth(getAdminApp());

// let firestoreConfigured = false;
// export const adminDb = () => {
//   const db = getFirestore(getAdminApp());
//   // Optional fields throughout this codebase are written as `field: value || undefined`;
//   // the Admin SDK rejects literal `undefined` values unless this is set.
//   if (!firestoreConfigured) {
//     db.settings({ ignoreUndefinedProperties: true });
//     firestoreConfigured = true;
//   }
//   return db;
// };
export const adminDb = () => {
  return getFirestore(getAdminApp());
};

// Server Actions ('use server' files) must not import firebase-admin
// subpaths directly - see next.config.js comment for why that breaks Next
// 14.0.3's Server Action bundling. Route FieldValue helpers through here
// instead, since this module (not itself a 'use server' file) is unaffected.
export const serverTimestamp = () => FieldValue.serverTimestamp();
export const arrayUnion = (...values: unknown[]) => FieldValue.arrayUnion(...values);
