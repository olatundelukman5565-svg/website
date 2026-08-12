"use client";

import { useActionState } from "react";
import type { Category } from "@/types";
import type { CategoryFormState } from "@/lib/actions/categories";

type CategoryAction = (state: CategoryFormState, formData: FormData) => Promise<CategoryFormState>;

const initialState: CategoryFormState = {};

export function CategoryForm({
  action,
  category,
  categories,
  submitLabel,
}: {
  action: CategoryAction;
  category?: Category;
  categories: Category[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const parentOptions = categories.filter((c) => c.id !== category?.id && !c.parentId);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-stone-700">
          Category name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={category?.name}
          required
          className="w-full rounded-md border border-stone-300 px-3.5 py-2.5 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-stone-700">
          Short description <span className="text-stone-400">(used on the portfolio index card)</span>
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={category?.description}
          required
          rows={2}
          className="w-full rounded-md border border-stone-300 px-3.5 py-2.5 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="intro" className="mb-1.5 block text-sm font-medium text-stone-700">
          Category page introduction
        </label>
        <textarea
          id="intro"
          name="intro"
          defaultValue={category?.intro}
          required
          rows={4}
          className="w-full rounded-md border border-stone-300 px-3.5 py-2.5 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="capabilities" className="mb-1.5 block text-sm font-medium text-stone-700">
          Capabilities <span className="text-stone-400">(one per line)</span>
        </label>
        <textarea
          id="capabilities"
          name="capabilities"
          defaultValue={category?.capabilities.join("\n")}
          rows={5}
          className="w-full rounded-md border border-stone-300 px-3.5 py-2.5 font-mono text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="order" className="mb-1.5 block text-sm font-medium text-stone-700">
            Sort order
          </label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={category?.order ?? 0}
            className="w-full rounded-md border border-stone-300 px-3.5 py-2.5 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="parentId" className="mb-1.5 block text-sm font-medium text-stone-700">
            Parent category <span className="text-stone-400">(optional)</span>
          </label>
          <select
            id="parentId"
            name="parentId"
            defaultValue={category?.parentId ?? ""}
            className="w-full rounded-md border border-stone-300 bg-white px-3.5 py-2.5 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          >
            <option value="">None — top-level category</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-stone-900 px-5 py-2.5 font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
