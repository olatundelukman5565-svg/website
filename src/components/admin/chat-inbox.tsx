"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import clsx from "clsx";
import { format, formatDistanceToNow } from "date-fns";
import {
  archiveConversationAction,
  deleteConversationAction,
  getAdminConversation,
  listAdminConversations,
  sendAdminMessage,
} from "@/lib/actions/admin-chat";
import { ChatAttachmentPreview } from "@/components/shared/attachment-preview";
import type { ChatConversation, ChatMessage } from "@/types";

const LIST_POLL_MS = 6000;
const THREAD_POLL_MS = 3500;

export function ChatInbox({ initialConversations }: { initialConversations: ChatConversation[] }) {
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<{ conversation: ChatConversation; messages: ChatMessage[] } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const list = await listAdminConversations(showArchived);
      if (!cancelled) setConversations(list);
    }
    poll();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") poll();
    }, LIST_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [showArchived]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    async function poll() {
      const res = await getAdminConversation(selectedId!);
      if (cancelled || "error" in res) return;
      setThread(res);
      setConversations((prev) => prev.map((c) => (c.id === res.conversation.id ? res.conversation : c)));
    }
    poll();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") poll();
    }, THREAD_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedId]);

  function selectConversation(id: string) {
    setThread(null);
    setSelectedId(id);
  }

  function closeThread() {
    setThread(null);
    setSelectedId(null);
  }

  const activeThread = thread && thread.conversation.id === selectedId ? thread : null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.buyerName.toLowerCase().includes(q) ||
        c.buyerEmail.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border border-stone-200 bg-white md:h-[calc(100vh-6rem)]">
      <div
        className={clsx(
          "flex w-full shrink-0 flex-col border-r border-stone-200 md:w-80",
          selectedId ? "hidden md:flex" : "flex"
        )}
      >
        <div className="space-y-2 border-b border-stone-200 p-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
          <label className="flex items-center gap-2 text-xs text-stone-500">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            Show archived
          </label>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => selectConversation(c.id)}
              className={clsx(
                "flex w-full flex-col gap-0.5 border-b border-stone-100 px-4 py-3 text-left transition hover:bg-stone-50",
                selectedId === c.id && "bg-amber-50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-stone-900">{c.buyerName}</p>
                <span className="shrink-0 text-[11px] text-stone-400">
                  {formatDistanceToNow(new Date(c.lastMessageAt), { addSuffix: false })}
                </span>
              </div>
              <p className="truncate text-xs text-stone-500">{c.buyerEmail}</p>
              <div className="flex items-center justify-between gap-2">
                <p className="flex min-w-0 items-center gap-1 truncate text-xs text-stone-500">
                  {c.lastSenderRole === "admin" && <span className="text-stone-400">You: </span>}
                  {c.lastMessageHasAttachments && <span aria-hidden>📎</span>}
                  <span className="truncate">{c.lastMessage || "—"}</span>
                </p>
                {c.unreadByAdmin > 0 && (
                  <span className="shrink-0 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-stone-950">
                    {c.unreadByAdmin}
                  </span>
                )}
              </div>
              {c.archived && (
                <span className="mt-0.5 inline-flex w-fit rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-500">
                  Archived
                </span>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-stone-400">No conversations found.</p>
          )}
        </div>
      </div>

      <div className={clsx("flex min-w-0 flex-1 flex-col", !selectedId && "hidden md:flex")}>
        {!selectedId && (
          <div className="flex flex-1 items-center justify-center text-sm text-stone-400">
            Select a conversation to view messages.
          </div>
        )}
        {selectedId && activeThread && (
          <ThreadView
            key={selectedId}
            thread={activeThread}
            onBack={closeThread}
            onArchivedOrDeleted={closeThread}
          />
        )}
        {selectedId && !activeThread && (
          <div className="flex flex-1 items-center justify-center text-sm text-stone-400">Loading…</div>
        )}
      </div>
    </div>
  );
}

function ThreadView({
  thread,
  onBack,
  onArchivedOrDeleted,
}: {
  thread: { conversation: ChatConversation; messages: ChatMessage[] };
  onBack: () => void;
  onArchivedOrDeleted: () => void;
}) {
  const { conversation, messages } = thread;
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const lastAdminIndex = [...messages].reverse().findIndex((m) => m.senderRole === "admin");
  const lastAdminMessageId =
    lastAdminIndex === -1 ? null : messages[messages.length - 1 - lastAdminIndex].id;
  const readByBuyer = conversation.unreadByBuyer === 0;

  return (
    <>
      <header className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border border-stone-200 px-2 py-1 text-xs text-stone-500 hover:bg-stone-50 md:hidden"
          >
            ← Back
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-stone-900">{conversation.buyerName}</p>
              <span
                className={clsx(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  conversation.archived ? "bg-stone-100 text-stone-500" : "bg-emerald-50 text-emerald-700"
                )}
              >
                {conversation.archived ? "Archived" : "Active"}
              </span>
            </div>
            <p className="truncate text-xs text-stone-500">{conversation.buyerEmail}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await archiveConversationAction(conversation.id, !conversation.archived);
                onArchivedOrDeleted();
              })
            }
            className="rounded-md border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-50"
          >
            {conversation.archived ? "Unarchive" : "Archive"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm(`Delete the conversation with ${conversation.buyerName}? This can't be undone.`)) {
                startTransition(async () => {
                  await deleteConversationAction(conversation.id);
                  onArchivedOrDeleted();
                });
              }
            }}
            className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-stone-50 px-4 py-4">
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={clsx("flex", m.senderRole === "admin" ? "justify-end" : "justify-start")}>
              <div className="max-w-[75%]">
                <div
                  className={clsx(
                    "space-y-2 rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.senderRole === "admin"
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
                    m.senderRole === "admin" ? "text-right" : "text-left"
                  )}
                >
                  {format(new Date(m.createdAt), "MMM d, p")}
                  {m.senderRole === "admin" && m.id === lastAdminMessageId && readByBuyer && " · Read"}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      <AdminComposer conversationId={conversation.id} />
    </>
  );
}

function AdminComposer({ conversationId }: { conversationId: string }) {
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
      const res = await sendAdminMessage({}, fd);
      if (res.error) {
        setError(res.error);
        return;
      }
      setText("");
      setFiles([]);
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
              <span className="max-w-[10rem] truncate">{f.name}</span>
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
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handlePick} />
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
          placeholder="Reply to this client…"
          rows={1}
          className="max-h-32 flex-1 resize-none rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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
