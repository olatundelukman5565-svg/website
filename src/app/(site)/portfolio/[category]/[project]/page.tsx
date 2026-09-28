import { redirect, notFound } from "next/navigation";
import { getCategoryBySlug, listCategories } from "@/lib/data/categories";
import { getProjectBySlug } from "@/lib/data/projects";
import { projectHref } from "@/lib/portfolio-paths";

export const dynamic = "force-dynamic";

/**
 * Legacy URL shim — see the sibling [category]/page.tsx for context. Redirects
 * an old flat /portfolio/[category]/[project] link to its canonical nested URL.
 */
export default async function LegacyProjectRedirect({
  params,
}: {
  params: Promise<{ category: string; project: string }>;
}) {
  const { category: categorySlug, project: projectSlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const project = await getProjectBySlug(categorySlug, projectSlug);
  if (!project) notFound();

  const allCategories = await listCategories();
  redirect(projectHref(project, allCategories));
}
