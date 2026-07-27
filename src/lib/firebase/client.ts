"use client";

import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getClientApp() {
  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

// Auth/Firestore/Storage are constructed lazily (not at module load) because
// the Auth SDK validates the API key synchronously and would otherwise throw
// during server-side rendering / static generation whenever .env.local isn't
// configured yet (e.g. before the Firebase Setup Guide has been completed).
let _auth: Auth | undefined;
let _db: Firestore | undefined;

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getClientApp());
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (!_db) _db = getFirestore(getClientApp());
  return _db;
}
