"use client";

import { useActionState } from "react";
import Image from "next/image";
import type { Category, Project } from "@/types";
import type { ProjectFormState } from "@/lib/actions/projects";

type ProjectAction = (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;

const initialState: ProjectFormState = {};

const fieldClass =
  "w-full rounded-md border border-stone-300 px-3.5 py-2.5 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1.5 block text-sm font-medium text-stone-700";

export function ProjectForm({
  action,
  project,
  categories,
  submitLabel,
}: {
  action: ProjectAction;
  project?: Project;
  categories: Category[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-8">
      <section className="grid gap-5 rounded-xl border border-stone-200 bg-white p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="title" className={labelClass}>
            Project title
          </label>
          <input id="title" name="title" defaultValue={project?.title} required className={fieldClass} />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className={labelClass}>
            Project description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={project?.description}
            required
            rows={5}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="categoryId" className={labelClass}>
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={project?.categoryId}
            required
            className={`${fieldClass} bg-white`}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentId ? "— " : ""}
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={project?.status ?? "draft"}
            className={`${fieldClass} bg-white`}
          >
            <option value="draft">Draft (hidden from site)</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div>
          <label htmlFor="year" className={labelClass}>
            Project year
          </label>
          <input
            id="year"
            name="year"
            type="number"
            defaultValue={project?.year ?? undefined}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="client" className={labelClass}>
            Client <span className="text-stone-400">(optional)</span>
          </label>
          <input id="client" name="client" defaultValue={project?.client ?? undefined} className={fieldClass} />
        </div>

        <div>
          <label htmlFor="projectType" className={labelClass}>
            Project type <span className="text-stone-400">(e.g. Residential, Commercial)</span>
          </label>
          <input
            id="projectType"
            name="projectType"
            defaultValue={project?.projectType ?? undefined}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="order" className={labelClass}>
            Sort order <span className="text-stone-400">(lower = first)</span>
          </label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={project?.order ?? 0}
            className={fieldClass}
          />
        </div>

        <div className="flex items-center gap-2 md:col-span-2">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            defaultChecked={project?.featured}
            className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
          />
          <label htmlFor="featured" className="text-sm font-medium text-stone-700">
            Feature this project on the homepage
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-semibold text-stone-900">Cover image</h2>
        <p className="mt-1 text-sm text-stone-500">
          Shown on project cards. If left empty, the first gallery image is used.
        </p>
        {project?.coverImage && (
          <div className="mt-3">
            <Image
              src={project.coverImage.url}
              alt="Current cover"
              width={120}
              height={90}
              className="rounded-md border border-stone-200 object-cover"
            />
          </div>
        )}
        <input
          type="file"
          name="coverImage"
          accept="image/jpeg,image/png,image/webp"
          className="mt-3 block text-sm"
        />
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-semibold text-stone-900">Gallery images</h2>
        <p className="mt-1 text-sm text-stone-500">
          Upload multiple images (JPG, PNG, WebP). You can add more anytime.
        </p>
        {project && project.images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {project.images.map((img) => (
              <label key={img.path} className="relative block cursor-pointer">
                <Image
                  src={img.url}
                  alt=""
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-md border border-stone-200 object-cover"
                />
                <span className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <input type="checkbox" name="removeImages" value={img.path} />
                  Remove
                </span>
              </label>
            ))}
          </div>
        )}
        <input
          type="file"
          name="images"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="mt-3 block text-sm"
        />
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-semibold text-stone-900">PDF document</h2>
        <p className="mt-1 text-sm text-stone-500">
          A preview thumbnail is generated automatically from the first page.
        </p>
        {project?.pdf && (
          <div className="mt-3 flex items-center gap-3">
            {project.pdfPreviewUrl && (
              <Image
                src={project.pdfPreviewUrl}
                alt="PDF preview"
                width={70}
                height={90}
                className="rounded-md border border-stone-200 object-cover"
              />
            )}
            <div className="text-sm">
              <a
                href={project.pdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-amber-600 hover:underline"
              >
                {project.pdf.name}
              </a>
              <label className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <input type="checkbox" name="removePdf" />
                Remove PDF
              </label>
            </div>
          </div>
        )}
        <input type="file" name="pdf" accept="application/pdf" className="mt-3 block text-sm" />
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-semibold text-stone-900">Additional files</h2>
        <p className="mt-1 text-sm text-stone-500">Optional extra documents or files for this project.</p>
        {project && project.additionalFiles.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {project.additionalFiles.map((f) => (
              <li key={f.path} className="flex items-center gap-2">
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                  {f.name}
                </a>
                <label className="flex items-center gap-1 text-xs text-red-600">
                  <input type="checkbox" name="removeFiles" value={f.path} />
                  Remove
                </label>
              </li>
            ))}
          </ul>
        )}
        <input type="file" name="additionalFiles" multiple className="mt-3 block text-sm" />
      </section>

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
