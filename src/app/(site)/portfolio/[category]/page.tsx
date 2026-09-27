import { redirect, notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/data/categories";
import { categoryHref } from "@/lib/portfolio-paths";
import { listCategories } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

/**
 * Legacy URL shim. Categories used to live at a single flat /portfolio/[category]
 * segment; the site is now organized as /2d/[subcategory] and /3d-model/[subcategory].
 * This route resolves the old slug and redirects to the canonical new location, so
 * any bookmarked or indexed links keep working instead of 404ing.
 */
export default async function LegacyCategoryRedirect({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const allCategories = await listCategories();
  const target = categoryHref(category, allCategories);
  if (target === `/portfolio/${slug}`) notFound(); // no canonical new location for this category (e.g. an unrelated top-level category)
  redirect(target);
}
