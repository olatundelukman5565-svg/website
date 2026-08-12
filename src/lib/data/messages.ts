import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import type { ContactMessage } from "@/types";

const COLLECTION = "messages";

function toMessage(id: string, data: FirebaseFirestore.DocumentData): ContactMessage {
  return {
    id,
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    service: data.service ?? null,
    read: !!data.read,
    createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
  };
}

export interface MessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  service?: string | null;
}

export async function createMessage(input: MessageInput): Promise<string> {
  const ref = await adminDb.collection(COLLECTION).add({
    ...input,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function listMessages(): Promise<ContactMessage[]> {
  const snap = await adminDb.collection(COLLECTION).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => toMessage(d.id, d.data()));
}

export async function markMessageRead(id: string, read = true): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).update({ read });
}

export async function deleteMessage(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}

export async function countUnreadMessages(): Promise<number> {
  const snap = await adminDb.collection(COLLECTION).where("read", "==", false).count().get();
  return snap.data().count;
}
