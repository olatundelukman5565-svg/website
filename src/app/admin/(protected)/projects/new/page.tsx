import Link from "next/link";
import { listCategories } from "@/lib/data/categories";
import { createProjectAction } from "@/lib/actions/projects";
import { ProjectForm } from "@/components/admin/project-form";

export default async function NewProjectPage() {
  const categories = await listCategories();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/projects" className="text-sm text-stone-500 hover:text-stone-800">
        ← Back to projects
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900">New project</h1>
      <p className="mt-1 text-stone-500">
        Upload a cover image, gallery images, and an optional PDF. Set status to Published to make it live.
      </p>
      <div className="mt-6">
        <ProjectForm action={createProjectAction} categories={categories} submitLabel="Create project" />
      </div>
    </div>
  );
}
