"use client";

import clsx from "clsx";
import { ChatSession } from "@/components/site/chat-session";

export function ChatWidget({
  open,
  onClose,
  chatEnabled,
  onUnreadChange,
}: {
  open: boolean;
  onClose: () => void;
  chatEnabled: boolean;
  onUnreadChange?: (count: number) => void;
}) {
  return (
    <div
      className={clsx(
        "fixed bottom-24 right-5 z-50 flex h-[32rem] max-h-[75vh] w-[23rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl transition-all duration-200 sm:right-6",
        open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
      role="dialog"
      aria-label="Chat with Neo Vision Team"
      aria-hidden={!open}
    >
      <header className="flex items-center justify-between bg-stone-950 px-4 py-3.5">
        <div>
          <p className="font-display text-sm font-semibold text-white">Neo Vision Team</p>
          <p className="text-xs text-stone-400">
            {chatEnabled ? "We usually reply within a day" : "Chat is currently unavailable"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </header>

      <ChatSession active={open} chatEnabled={chatEnabled} onUnreadChange={onUnreadChange} />
    </div>
  );
}
