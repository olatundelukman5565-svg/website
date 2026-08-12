"use client";

import { useActionState } from "react";
import { submitContactAction, type ContactFormState } from "@/lib/actions/contact";
import type { Category } from "@/types";

const initialState: ContactFormState = {};
const fieldClass =
  "w-full rounded-md border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1.5 block text-sm font-medium text-stone-700";

export function ContactForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(submitContactAction, initialState);

  if (state.success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
        <p className="font-display text-lg font-semibold">Message sent.</p>
        <p className="mt-1 text-sm">Thanks for reaching out — we&apos;ll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input id="name" name="name" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input id="email" name="email" type="email" required className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="service" className={labelClass}>
          Project / service
        </label>
        <select id="service" name="service" defaultValue="" className={`${fieldClass} bg-white`}>
          <option value="">Select a service (optional)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="subject" className={labelClass}>
          Subject
        </label>
        <input id="subject" name="subject" required className={fieldClass} />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea id="message" name="message" required rows={6} className={fieldClass} />
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-stone-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
