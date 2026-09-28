"use client";

import { ChatSession } from "@/components/site/chat-session";

export function LiveChatPage({ chatEnabled }: { chatEnabled: boolean }) {
  return (
    <div className="mx-auto flex h-[70vh] min-h-[28rem] max-w-2xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <ChatSession
        active
        chatEnabled={chatEnabled}
        scrollAreaClassName="flex-1 overflow-y-auto bg-stone-50 px-4 py-6"
      />
    </div>
  );
}
