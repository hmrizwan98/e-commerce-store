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

// Firestore.settings() may only be called once, ever, on a given Firestore
// instance - calling it a second time throws "Firestore has already been
// initialized". Next.js bundles this module SEPARATELY per route/action (each
// route gets its own compiled chunk), so a plain module-scoped `let` flag is
// duplicated once per chunk and does NOT track whether some OTHER chunk,
// running in the same warm serverless instance, already configured the one
// truly-shared Firestore instance (getFirestore(app) itself IS a real
// singleton, keyed by the underlying firebase-admin package's own registry -
// only this app-level guard flag was not). Storing the guard on `globalThis`
// keys it to the actual single JS global object for the whole process,
// immune to per-route code-splitting, so it reflects reality regardless of
// which chunk runs first.
const FIRESTORE_CONFIGURED_KEY = Symbol.for("app.firestoreConfigured");
export const adminDb = () => {
  const db = getFirestore(getAdminApp());
  // Optional fields throughout this codebase are written as `field: value || undefined`;
  // the Admin SDK rejects literal `undefined` values unless this is set.
  if (!(globalThis as Record<symbol, boolean>)[FIRESTORE_CONFIGURED_KEY]) {
    db.settings({ ignoreUndefinedProperties: true });
    (globalThis as Record<symbol, boolean>)[FIRESTORE_CONFIGURED_KEY] = true;
  }
  return db;
};

// Server Actions ('use server' files) must not import firebase-admin
// subpaths directly - see next.config.js comment for why that breaks Next
// 14.0.3's Server Action bundling. Route FieldValue helpers through here
// instead, since this module (not itself a 'use server' file) is unaffected.
export const serverTimestamp = () => FieldValue.serverTimestamp();
export const arrayUnion = (...values: unknown[]) => FieldValue.arrayUnion(...values);
