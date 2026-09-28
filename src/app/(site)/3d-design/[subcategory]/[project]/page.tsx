import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChildCategoryBySlug, listCategories } from "@/lib/data/categories";
import { getProjectByCategoryAndSlug, listRelatedProjects } from "@/lib/data/projects";
import { ProjectDetail } from "@/components/site/project-detail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subcategory: string; project: string }>;
}): Promise<Metadata> {
  const { subcategory, project: projectSlug } = await params;
  const categories = await listCategories();
  const division = categories.find((c) => c.slug === "3d-design" && !c.parentId);
  if (!division) return {};
  const category = categories.find((c) => c.parentId === division.id && c.slug === subcategory);
  if (!category) return {};
  const project = await getProjectByCategoryAndSlug(category.id, projectSlug);
  if (!project) return {};
  return { title: project.title, description: project.description.slice(0, 160) };
}

export default async function ThreeDModelProjectPage({
  params,
}: {
  params: Promise<{ subcategory: string; project: string }>;
}) {
  const { subcategory, project: projectSlug } = await params;
  const categories = await listCategories();
  const division = categories.find((c) => c.slug === "3d-design" && !c.parentId);
  if (!division) notFound();

  const category = await getChildCategoryBySlug(division.id, subcategory);
  if (!category) notFound();

  const project = await getProjectByCategoryAndSlug(category.id, projectSlug);
  if (!project || project.status !== "published") notFound();

  const related = await listRelatedProjects(category.id, project.id, 3);

  return (
    <ProjectDetail
      project={project}
      category={category}
      related={related}
      allCategories={categories}
      breadcrumbBase={[{ label: division.name, href: "/3d-design" }]}
    />
  );
}
