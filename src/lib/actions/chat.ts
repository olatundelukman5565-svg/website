"use server";

import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import {
  addMessage,
  createConversation,
  findConversationIdByToken,
  getConversationById,
  getConversationDocById,
  listMessages,
  markReadByBuyer,
} from "@/lib/data/chat";
import { getSiteContent } from "@/lib/data/site-content";
import { uploadChatAttachment } from "@/lib/upload";
import { isRealFile, validateChatAttachment, MAX_CHAT_ATTACHMENTS_PER_MESSAGE, MAX_CHAT_MESSAGE_LENGTH } from "@/lib/validation";
import { CHAT_TOKEN_COOKIE } from "@/lib/chat-cookie-name";
import type { ChatAttachment, ChatConversation, ChatMessage } from "@/types";

const TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

async function getTokenFromCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(CHAT_TOKEN_COOKIE)?.value ?? null;
}

async function setTokenCookie(token: string) {
  const store = await cookies();
  store.set(CHAT_TOKEN_COOKIE, token, {
    maxAge: TOKEN_COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

/** Confirms the visitor's chat cookie actually owns this conversation before any read/write. */
async function verifyOwnership(conversationId: string): Promise<boolean> {
  const token = await getTokenFromCookie();
  if (!token) return false;
  const doc = await getConversationDocById(conversationId);
  return !!doc && doc.buyerToken === token;
}

export interface ChatWidgetSettings {
  chatEnabled: boolean;
  welcomeMessage: string;
  whatsappNumber: string;
  contactEmail: string;
}

export async function getBuyerChatSettings(): Promise<ChatWidgetSettings> {
  const content = await getSiteContent();
  return {
    chatEnabled: content.communication.chatEnabled,
    welcomeMessage: content.communication.welcomeMessage,
    whatsappNumber: content.communication.whatsappNumber,
    contactEmail: content.contact.email,
  };
}

/** Looks up an existing conversation for the returning visitor without creating one. */
export async function getActiveConversationId(): Promise<string | null> {
  const token = await getTokenFromCookie();
  if (!token) return null;
  return findConversationIdByToken(token);
}

export interface StartChatState {
  error?: string;
  conversationId?: string;
}

export async function startBuyerConversation(
  _prevState: StartChatState,
  formData: FormData
): Promise<StartChatState> {
  const existingId = await getActiveConversationId();
  if (existingId) return { conversationId: existingId };

  const content = await getSiteContent();
  if (!content.communication.chatEnabled) {
    return { error: "Chat is currently unavailable. Please reach out via email or WhatsApp instead." };
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();

  if (!name || !email) {
    return { error: "Please enter your name and email." };
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const token = randomUUID();
  const conversationId = await createConversation({
    buyerName: name,
    buyerEmail: email,
    buyerToken: token,
    welcomeMessage: content.communication.welcomeMessage || undefined,
  });
  await setTokenCookie(token);

  return { conversationId };
}

export interface ChatThread {
  conversation: ChatConversation;
  messages: ChatMessage[];
}

export async function fetchBuyerMessages(conversationId: string): Promise<ChatThread | { error: string }> {
  const owns = await verifyOwnership(conversationId);
  if (!owns) return { error: "Conversation not found." };

  const conversation = await getConversationById(conversationId);
  if (!conversation) return { error: "Conversation not found." };

  const messages = await listMessages(conversationId);
  return { conversation, messages };
}

export interface SendChatMessageState {
  error?: string;
}

export async function sendBuyerMessage(
  _prevState: SendChatMessageState,
  formData: FormData
): Promise<SendChatMessageState> {
  const conversationId = String(formData.get("conversationId") || "");
  const owns = await verifyOwnership(conversationId);
  if (!owns) return { error: "Conversation not found." };

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

  await addMessage(conversationId, { senderRole: "buyer", text, attachments });
  return {};
}

export async function markConversationReadByBuyer(conversationId: string): Promise<void> {
  const owns = await verifyOwnership(conversationId);
  if (!owns) return;
  await markReadByBuyer(conversationId);
}
