import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function buildApp(): App {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const usingEmulators = !!process.env.FIRESTORE_EMULATOR_HOST;

  if (usingEmulators) {
    return initializeApp({
      projectId: projectId || "demo-neovision",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId || "demo-neovision"}.appspot.com`,
    });
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY (or run against the emulator suite with FIRESTORE_EMULATOR_HOST set)."
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
  });
}

const app = buildApp();

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);
export const bucket = adminStorage.bucket();
