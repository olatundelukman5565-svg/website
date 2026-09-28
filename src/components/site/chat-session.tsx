"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import clsx from "clsx";
import { format } from "date-fns";
import {
  fetchBuyerMessages,
  getActiveConversationId,
  markConversationReadByBuyer,
  sendBuyerMessage,
  startBuyerConversation,
  type StartChatState,
} from "@/lib/actions/chat";
import { ChatAttachmentPreview } from "@/components/shared/attachment-preview";
import type { ChatConversation, ChatMessage } from "@/types";

const ACTIVE_POLL_MS = 3000;
const BACKGROUND_POLL_MS = 15000;

type Phase = "loading" | "gate" | "thread";

/**
 * Shared buyer chat session: name/email gate, polling thread, and composer.
 * Used by both the floating widget panel and the dedicated /live-chat page —
 * `active` controls poll speed and whether unread messages get marked read,
 * so a background floating panel doesn't silently consume unread badges.
 */
export function ChatSession({
  active,
  chatEnabled,
  onUnreadChange,
  scrollAreaClassName,
}: {
  active: boolean;
  chatEnabled: boolean;
  onUnreadChange?: (count: number) => void;
  scrollAreaClassName?: string;
}) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    getActiveConversationId().then((id) => {
      if (cancelled) return;
      if (id) {
        setConversationId(id);
        setPhase("thread");
      } else {
        setPhase("gate");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;

    async function poll() {
      const res = await fetchBuyerMessages(conversationId!);
      if (cancelled || "error" in res) return;
      setMessages(res.messages);
      setConversation(res.conversation);
      if (active) {
        onUnreadChange?.(0);
        if (res.conversation.unreadByBuyer > 0) {
          await markConversationReadByBuyer(conversationId!);
        }
      } else {
        onUnreadChange?.(res.conversation.unreadByBuyer);
      }
    }

    poll();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") poll();
    }, active ? ACTIVE_POLL_MS : BACKGROUND_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, active]);

  useEffect(() => {
    if (active) bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, active]);

  return (
    <>
      <div className={scrollAreaClassName ?? "flex-1 overflow-y-auto bg-stone-50 px-3 py-4"}>
        {phase === "loading" && <p className="mt-10 text-center text-sm text-stone-400">Loading…</p>}
        {phase === "gate" && (
          <GateForm
            chatEnabled={chatEnabled}
            onStarted={(id) => {
              setConversationId(id);
              setPhase("thread");
            }}
          />
        )}
        {phase === "thread" && <MessageList messages={messages} conversation={conversation} />}
        <div ref={bottomRef} />
      </div>

      {phase === "thread" && conversationId && (
        <Composer
          conversationId={conversationId}
          onSent={() => {
            fetchBuyerMessages(conversationId).then((res) => {
              if (!("error" in res)) {
                setMessages(res.messages);
                setConversation(res.conversation);
              }
            });
          }}
        />
      )}
    </>
  );
}

function GateForm({ chatEnabled, onStarted }: { chatEnabled: boolean; onStarted: (id: string) => void }) {
  const [state, formAction, pending] = useActionState<StartChatState, FormData>(startBuyerConversation, {});

  useEffect(() => {
    if (state.conversationId) onStarted(state.conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.conversationId]);

  return (
    <div className="flex h-full flex-col justify-center px-2">
      <p className="font-display text-base font-semibold text-stone-900">Start a conversation</p>
      <p className="mt-1 text-sm text-stone-500">
        Tell us who you are and we&apos;ll open a private chat with the Neo Vision team.
      </p>
      <form action={formAction} className="mt-4 space-y-3">
        <input
          name="name"
          placeholder="Full name"
          required
          disabled={!chatEnabled}
          className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:bg-stone-100"
        />
        <input
          name="email"
          type="email"
          placeholder="Gmail / email address"
          required
          disabled={!chatEnabled}
          className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:bg-stone-100"
        />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending || !chatEnabled}
          className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Starting…" : "Start chat"}
        </button>
      </form>
    </div>
  );
}

function MessageList({
  messages,
  conversation,
}: {
  messages: ChatMessage[];
  conversation: ChatConversation | null;
}) {
  if (messages.length === 0) {
    return <p className="mt-10 text-center text-sm text-stone-400">Say hello to get started.</p>;
  }

  const lastBuyerIndex = [...messages].reverse().findIndex((m) => m.senderRole === "buyer");
  const lastBuyerMessageId =
    lastBuyerIndex === -1 ? null : messages[messages.length - 1 - lastBuyerIndex].id;
  const seen = !!conversation && conversation.unreadByAdmin === 0;

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m.id} className={clsx("flex", m.senderRole === "buyer" ? "justify-end" : "justify-start")}>
          <div className="max-w-[85%]">
            <div
              className={clsx(
                "space-y-2 rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.senderRole === "buyer"
                  ? "rounded-br-sm bg-stone-900 text-white"
                  : "rounded-bl-sm border border-stone-200 bg-white text-stone-800"
              )}
            >
              {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
              {m.attachments.map((a) => (
                <ChatAttachmentPreview key={a.path} attachment={a} />
              ))}
            </div>
            <p
              className={clsx(
                "mt-1 text-[11px] text-stone-400",
                m.senderRole === "buyer" ? "text-right" : "text-left"
              )}
            >
              {format(new Date(m.createdAt), "p")}
              {m.senderRole === "buyer" && m.id === lastBuyerMessageId && seen && " · Seen"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Composer({ conversationId, onSent }: { conversationId: string; onSent: () => void }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...picked]);
    e.target.value = "";
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSend() {
    if (!text.trim() && files.length === 0) return;
    setError(null);
    const fd = new FormData();
    fd.set("conversationId", conversationId);
    fd.set("text", text);
    files.forEach((f) => fd.append("files", f));

    startTransition(async () => {
      const res = await sendBuyerMessage({}, fd);
      if (res.error) {
        setError(res.error);
        return;
      }
      setText("");
      setFiles([]);
      onSent();
    });
  }

  return (
    <div className="border-t border-stone-200 bg-white p-3">
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {files.map((f, i) => (
            <span
              key={`${f.name}-${i}`}
              className="flex items-center gap-1 rounded-full bg-stone-100 py-1 pl-2.5 pr-1 text-xs text-stone-600"
            >
              <span className="max-w-[8rem] truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`Remove ${f.name}`}
                className="flex h-4 w-4 items-center justify-center rounded-full text-stone-400 hover:bg-stone-200 hover:text-stone-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handlePick}
          accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/quicktime,video/webm"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach a file"
          title="Attach a file"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50"
        >
          📎
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message…"
          rows={1}
          className="max-h-24 flex-1 resize-none rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={pending || (!text.trim() && files.length === 0)}
          className="flex h-9 shrink-0 items-center justify-center rounded-full bg-stone-900 px-4 text-sm font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
