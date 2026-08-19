"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  addMessage,
  countConversationsWithUnreadAdmin,
  deleteConversationAndMessages,
  getConversationById,
  listConversations,
  listMessages,
  markReadByAdmin,
  setConversationArchived,
} from "@/lib/data/chat";
import { deleteStoragePath, uploadChatAttachment } from "@/lib/upload";
import { isRealFile, validateChatAttachment, MAX_CHAT_ATTACHMENTS_PER_MESSAGE, MAX_CHAT_MESSAGE_LENGTH } from "@/lib/validation";
import type { ChatAttachment, ChatConversation, ChatMessage } from "@/types";

export async function listAdminConversations(includeArchived = false): Promise<ChatConversation[]> {
  await requireAdmin();
  return listConversations({ includeArchived });
}

export interface AdminChatThread {
  conversation: ChatConversation;
  messages: ChatMessage[];
}

export async function getAdminConversation(id: string): Promise<AdminChatThread | { error: string }> {
  await requireAdmin();
  const conversation = await getConversationById(id);
  if (!conversation) return { error: "Conversation not found." };

  const messages = await listMessages(id);
  if (conversation.unreadByAdmin > 0) {
    await markReadByAdmin(id);
  }
  return { conversation: { ...conversation, unreadByAdmin: 0 }, messages };
}

export interface SendChatMessageState {
  error?: string;
}

export async function sendAdminMessage(
  _prevState: SendChatMessageState,
  formData: FormData
): Promise<SendChatMessageState> {
  await requireAdmin();

  const conversationId = String(formData.get("conversationId") || "");
  const conversation = await getConversationById(conversationId);
  if (!conversation) return { error: "Conversation not found." };

  const text = String(formData.get("text") || "").trim().slice(0, MAX_CHAT_MESSAGE_LENGTH);
  const files = formData.getAll("files").filter(isRealFile) as File[];

  if (!text && files.length === 0) {
    return { error: "Write a message or attach a file." };
  }
  if (files.length > MAX_CHAT_ATTACHMENTS_PER_MESSAGE) {
    return { error: `You can attach up to ${MAX_CHAT_ATTACHMENTS_PER_MESSAGE} files at once.` };
  }
  for (const f of files) {
    const err = validateChatAttachment(f);
    if (err) return { error: err };
  }

  const attachments: ChatAttachment[] = [];
  for (const f of files) {
    attachments.push(await uploadChatAttachment(f, `chat/${conversationId}`));
  }

  await addMessage(conversationId, { senderRole: "admin", text, attachments });
  revalidatePath("/admin/chat");
  return {};
}

export async function markConversationReadByAdminAction(id: string): Promise<void> {
  await requireAdmin();
  await markReadByAdmin(id);
  revalidatePath("/admin/chat");
}

export async function archiveConversationAction(id: string, archived: boolean): Promise<void> {
  await requireAdmin();
  await setConversationArchived(id, archived);
  revalidatePath("/admin/chat");
}

export async function deleteConversationAction(id: string): Promise<void> {
  await requireAdmin();
  const messages = await deleteConversationAndMessages(id);
  await Promise.all(
    messages.flatMap((m) => m.attachments.map((a) => deleteStoragePath(a.path, a.resourceType)))
  );
  revalidatePath("/admin/chat");
}

export async function countUnreadChatAction(): Promise<number> {
  await requireAdmin();
  return countConversationsWithUnreadAdmin();
}
