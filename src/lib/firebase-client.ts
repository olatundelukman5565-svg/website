"use client";

import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function isPushConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    VAPID_KEY
  );
}

export function serviceWorkerUrl(): string {
  const params = new URLSearchParams({
    apiKey: firebaseConfig.apiKey || "",
    projectId: firebaseConfig.projectId || "",
    messagingSenderId: firebaseConfig.messagingSenderId || "",
    appId: firebaseConfig.appId || "",
  });
  return `/firebase-messaging-sw.js?${params.toString()}`;
}

let messagingPromise: Promise<Messaging | null> | null = null;

export function getMessagingClient(): Promise<Messaging | null> {
  if (!isPushConfigured()) return Promise.resolve(null);
  if (!messagingPromise) {
    messagingPromise = isSupported().then((supported) => {
      if (!supported) return null;
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      return getMessaging(app);
    });
  }
  return messagingPromise;
}
