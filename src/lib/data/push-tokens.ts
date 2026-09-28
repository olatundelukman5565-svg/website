import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

const COLLECTION = "adminPushTokens";

export async function saveAdminPushToken(token: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(token).set(
    { token, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
}

export async function removeAdminPushToken(token: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(token).delete();
}

export async function listAdminPushTokens(): Promise<string[]> {
  const snap = await adminDb.collection(COLLECTION).get();
  return snap.docs.map((d) => d.id);
}
