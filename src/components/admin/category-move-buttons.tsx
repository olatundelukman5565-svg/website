"use client";

import { useTransition } from "react";
import { moveCategoryAction } from "@/lib/actions/categories";

export function CategoryMoveButtons({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => moveCategoryAction(id, "up"))}
        className="rounded border border-stone-200 px-1.5 py-0.5 text-xs text-stone-500 hover:bg-stone-100 disabled:opacity-50"
        aria-label="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => moveCategoryAction(id, "down"))}
        className="rounded border border-stone-200 px-1.5 py-0.5 text-xs text-stone-500 hover:bg-stone-100 disabled:opacity-50"
        aria-label="Move down"
      >
        ↓
      </button>
    </div>
  );
}
