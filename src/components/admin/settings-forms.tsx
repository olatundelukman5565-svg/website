"use client";

import { useActionState } from "react";
import {
  updateAboutAction,
  updateContactAction,
  updateHomepageAction,
  type SettingsFormState,
} from "@/lib/actions/site-content";
import type { AboutContent, ContactInfo, HomepageContent, Project } from "@/types";
import { FilePicker } from "@/components/admin/file-picker";

const initialState: SettingsFormState = {};
const fieldClass =
  "w-full rounded-md border border-stone-300 px-3.5 py-2.5 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1.5 block text-sm font-medium text-stone-700";

function StatusBanner({ state }: { state: SettingsFormState }) {
  if (state.error) {
    return <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>;
  }
  if (state.success) {
    return <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Saved.</p>;
  }
  return null;
}

export function HomepageSettingsForm({
  content,
  projects,
}: {
  content: HomepageContent;
  projects: Project[];
}) {
  const [state, formAction, pending] = useActionState(updateHomepageAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="heroEyebrow" className={labelClass}>
          Hero eyebrow text
        </label>
        <input id="heroEyebrow" name="heroEyebrow" defaultValue={content.heroEyebrow} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="heroTitle" className={labelClass}>
          Hero title
        </label>
        <input id="heroTitle" name="heroTitle" defaultValue={content.heroTitle} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="heroSubtitle" className={labelClass}>
          Hero subtitle
        </label>
        <textarea
          id="heroSubtitle"
          name="heroSubtitle"
          defaultValue={content.heroSubtitle}
          rows={3}
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="heroImage" className={labelClass}>
          Hero background image <span className="text-stone-400">(optional)</span>
        </label>
        <FilePicker id="heroImage" name="heroImage" accept="image/jpeg,image/png,image/webp" />
      </div>
      <div>
        <label htmlFor="aboutBlurb" className={labelClass}>
          Homepage about blurb
        </label>
        <textarea id="aboutBlurb" name="aboutBlurb" defaultValue={content.aboutBlurb} rows={4} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="whyChooseUs" className={labelClass}>
          Why choose us <span className="text-stone-400">(one per line: Title :: Description)</span>
        </label>
        <textarea
          id="whyChooseUs"
          name="whyChooseUs"
          defaultValue={content.whyChooseUs.map((w) => `${w.title} :: ${w.description}`).join("\n")}
          rows={5}
          className={`${fieldClass} font-mono text-sm`}
        />
      </div>
      <div>
        <p className={labelClass}>Featured projects (shown on homepage)</p>
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-stone-200 p-3">
          {projects.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="featuredProjectIds"
                value={p.id}
                defaultChecked={content.featuredProjectIds.includes(p.id)}
              />
              {p.title}
            </label>
          ))}
          {projects.length === 0 && <p className="text-sm text-stone-400">No published projects yet.</p>}
        </div>
      </div>
      <StatusBanner state={state} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-stone-900 px-5 py-2.5 font-medium text-white hover:bg-stone-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save homepage content"}
      </button>
    </form>
  );
}

export function AboutSettingsForm({ content }: { content: AboutContent }) {
  const [state, formAction, pending] = useActionState(updateAboutAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="intro" className={labelClass}>
          Intro statement
        </label>
        <textarea id="intro" name="intro" defaultValue={content.intro} rows={2} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="body" className={labelClass}>
          About body
        </label>
        <textarea id="body" name="body" defaultValue={content.body} rows={6} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="approach" className={labelClass}>
          Our approach <span className="text-stone-400">(one per line: Title :: Description)</span>
        </label>
        <textarea
          id="approach"
          name="approach"
          defaultValue={content.approach.map((a) => `${a.title} :: ${a.description}`).join("\n")}
          rows={5}
          className={`${fieldClass} font-mono text-sm`}
        />
      </div>
      <div>
        <label htmlFor="capabilities" className={labelClass}>
          Capabilities list <span className="text-stone-400">(one per line)</span>
        </label>
        <textarea
          id="capabilities"
          name="capabilities"
          defaultValue={content.capabilities.join("\n")}
          rows={6}
          className={`${fieldClass} font-mono text-sm`}
        />
      </div>
      <StatusBanner state={state} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-stone-900 px-5 py-2.5 font-medium text-white hover:bg-stone-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save about content"}
      </button>
    </form>
  );
}

export function ContactSettingsForm({ content }: { content: ContactInfo }) {
  const [state, formAction, pending] = useActionState(updateContactAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>
            Business email
          </label>
          <input id="email" name="email" defaultValue={content.email} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Business phone
          </label>
          <input id="phone" name="phone" defaultValue={content.phone} className={fieldClass} />
        </div>
      </div>
      <div>
        <label htmlFor="address" className={labelClass}>
          Address
        </label>
        <input id="address" name="address" defaultValue={content.address} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="hours" className={labelClass}>
          Business hours
        </label>
        <input id="hours" name="hours" defaultValue={content.hours} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="social" className={labelClass}>
          Social links <span className="text-stone-400">(one per line: Label :: URL)</span>
        </label>
        <textarea
          id="social"
          name="social"
          defaultValue={content.social.map((s) => `${s.label} :: ${s.url}`).join("\n")}
          rows={4}
          className={`${fieldClass} font-mono text-sm`}
        />
      </div>
      <StatusBanner state={state} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-stone-900 px-5 py-2.5 font-medium text-white hover:bg-stone-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save contact info"}
      </button>
    </form>
  );
}
