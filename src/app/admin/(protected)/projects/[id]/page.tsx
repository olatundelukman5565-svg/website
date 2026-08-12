import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/data/projects";
import { listCategories } from "@/lib/data/categories";
import { updateProjectAction, deleteProjectAction } from "@/lib/actions/projects";
import { ProjectForm } from "@/components/admin/project-form";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, categories] = await Promise.all([getProjectById(id), listCategories()]);

  if (!project) notFound();

  const boundUpdate = updateProjectAction.bind(null, id);
  const boundDelete = deleteProjectAction.bind(null, id);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/projects" className="text-sm text-stone-500 hover:text-stone-800">
        ← Back to projects
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">{project.title}</h1>
        <DeleteButton action={boundDelete} confirmMessage="Delete this project? This cannot be undone." />
      </div>
      <div className="mt-6">
        <ProjectForm action={boundUpdate} project={project} categories={categories} submitLabel="Save changes" />
      </div>
    </div>
  );
}
