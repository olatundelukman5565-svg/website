"use client";

import { useTransition } from "react";
import { deleteMessageAction, markMessageReadAction } from "@/lib/actions/messages";

export function MessageActions({ id, read }: { id: string; read: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => markMessageReadAction(id, !read))}
        className="rounded-md border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-50"
      >
        {read ? "Mark unread" : "Mark read"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this message?")) {
            startTransition(() => deleteMessageAction(id));
          }
        }}
        className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
