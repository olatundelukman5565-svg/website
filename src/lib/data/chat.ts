import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import type { ChatAttachment, ChatConversation, ChatMessage, ChatSenderRole } from "@/types";

const CONVERSATIONS = "conversations";
const MESSAGES = "messages";

function toConversation(id: string, data: FirebaseFirestore.DocumentData): ChatConversation {
  return {
    id,
    buyerName: data.buyerName,
    buyerEmail: data.buyerEmail,
    lastMessage: data.lastMessage ?? "",
    lastMessageAt: data.lastMessageAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    lastSenderRole: (data.lastSenderRole as ChatSenderRole) ?? "buyer",
    lastMessageHasAttachments: !!data.lastMessageHasAttachments,
    unreadByAdmin: data.unreadByAdmin ?? 0,
    unreadByBuyer: data.unreadByBuyer ?? 0,
    archived: !!data.archived,
    createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
  };
}

function toMessage(conversationId: string, id: string, data: FirebaseFirestore.DocumentData): ChatMessage {
  return {
    id,
    conversationId,
    senderRole: data.senderRole,
    text: data.text ?? "",
    attachments: data.attachments ?? [],
    createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
  };
}

function snippetFor(text: string, attachments: ChatAttachment[]): string {
  const trimmed = text.trim();
  if (trimmed) return trimmed.slice(0, 200);
  if (attachments.length === 1) return `📎 ${attachments[0].name}`;
  if (attachments.length > 1) return `📎 ${attachments.length} attachments`;
  return "";
}

export interface CreateConversationInput {
  buyerName: string;
  buyerEmail: string;
  buyerToken: string;
  welcomeMessage?: string;
}

export async function createConversation(input: CreateConversationInput): Promise<string> {
  const ref = await adminDb.collection(CONVERSATIONS).add({
    buyerName: input.buyerName,
    buyerEmail: input.buyerEmail,
    buyerToken: input.buyerToken,
    lastMessage: input.welcomeMessage ?? "",
    lastMessageAt: FieldValue.serverTimestamp(),
    lastSenderRole: "admin",
    lastMessageHasAttachments: false,
    unreadByAdmin: 0,
    unreadByBuyer: 0,
    archived: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (input.welcomeMessage) {
    await ref.collection(MESSAGES).add({
      senderRole: "admin",
      text: input.welcomeMessage,
      attachments: [],
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  return ref.id;
}

/** Internal lookup used only for verifying a buyer's cookie token server-side; never expose the raw doc (or its token) to a client. */
export async function getConversationDocById(
  id: string
): Promise<(FirebaseFirestore.DocumentData & { id: string }) | null> {
  const doc = await adminDb.collection(CONVERSATIONS).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data()! };
}

export async function findConversationIdByToken(token: string): Promise<string | null> {
  const snap = await adminDb.collection(CONVERSATIONS).where("buyerToken", "==", token).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].id;
}

export async function getConversationById(id: string): Promise<ChatConversation | null> {
  const doc = await adminDb.collection(CONVERSATIONS).doc(id).get();
  if (!doc.exists) return null;
  return toConversation(doc.id, doc.data()!);
}

export async function listConversations(opts: { includeArchived?: boolean } = {}): Promise<ChatConversation[]> {
  const snap = await adminDb.collection(CONVERSATIONS).orderBy("updatedAt", "desc").get();
  const all = snap.docs.map((d) => toConversation(d.id, d.data()));
  return opts.includeArchived ? all : all.filter((c) => !c.archived);
}

export async function listMessages(conversationId: string): Promise<ChatMessage[]> {
  const snap = await adminDb
    .collection(CONVERSATIONS)
    .doc(conversationId)
    .collection(MESSAGES)
    .orderBy("createdAt", "asc")
    .get();
  return snap.docs.map((d) => toMessage(conversationId, d.id, d.data()));
}

export interface AddMessageInput {
  senderRole: ChatSenderRole;
  text: string;
  attachments: ChatAttachment[];
}

export async function addMessage(conversationId: string, input: AddMessageInput): Promise<string> {
  const convRef = adminDb.collection(CONVERSATIONS).doc(conversationId);
  const msgRef = await convRef.collection(MESSAGES).add({
    senderRole: input.senderRole,
    text: input.text,
    attachments: input.attachments,
    createdAt: FieldValue.serverTimestamp(),
  });

  const isBuyer = input.senderRole === "buyer";
  await convRef.update({
    lastMessage: snippetFor(input.text, input.attachments),
    lastMessageAt: FieldValue.serverTimestamp(),
    lastSenderRole: input.senderRole,
    lastMessageHasAttachments: input.attachments.length > 0,
    updatedAt: FieldValue.serverTimestamp(),
    unreadByAdmin: isBuyer ? FieldValue.increment(1) : 0,
    unreadByBuyer: isBuyer ? 0 : FieldValue.increment(1),
  });

  return msgRef.id;
}

export async function markReadByAdmin(conversationId: string): Promise<void> {
  await adminDb.collection(CONVERSATIONS).doc(conversationId).update({ unreadByAdmin: 0 });
}

export async function markReadByBuyer(conversationId: string): Promise<void> {
  await adminDb.collection(CONVERSATIONS).doc(conversationId).update({ unreadByBuyer: 0 });
}

export async function setConversationArchived(conversationId: string, archived: boolean): Promise<void> {
  await adminDb.collection(CONVERSATIONS).doc(conversationId).update({ archived });
}

/** Deletes the conversation and its messages, returning the deleted messages so the caller can clean up attachment storage. */
export async function deleteConversationAndMessages(conversationId: string): Promise<ChatMessage[]> {
  const messages = await listMessages(conversationId);
  const msgsSnap = await adminDb.collection(CONVERSATIONS).doc(conversationId).collection(MESSAGES).get();
  const batch = adminDb.batch();
  msgsSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(adminDb.collection(CONVERSATIONS).doc(conversationId));
  await batch.commit();
  return messages;
}

export async function countConversationsWithUnreadAdmin(): Promise<number> {
  const snap = await adminDb.collection(CONVERSATIONS).where("unreadByAdmin", ">", 0).count().get();
  return snap.data().count;
}
