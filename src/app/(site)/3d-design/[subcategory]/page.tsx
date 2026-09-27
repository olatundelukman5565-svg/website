import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChildCategoryBySlug, listCategories } from "@/lib/data/categories";
import { listProjectsByCategory } from "@/lib/data/projects";
import { CategoryShowcase } from "@/components/site/category-showcase";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subcategory: string }>;
}): Promise<Metadata> {
  const { subcategory } = await params;
  const categories = await listCategories();
  const division = categories.find((c) => c.slug === "3d-design" && !c.parentId);
  if (!division) return {};
  const category = categories.find((c) => c.parentId === division.id && c.slug === subcategory);
  if (!category) return {};
  return { title: category.name, description: category.description };
}

export default async function ThreeDModelSubcategoryPage({
  params,
}: {
  params: Promise<{ subcategory: string }>;
}) {
  const { subcategory } = await params;
  const categories = await listCategories();
  const division = categories.find((c) => c.slug === "3d-design" && !c.parentId);
  if (!division) notFound();

  const category = await getChildCategoryBySlug(division.id, subcategory);
  if (!category || !category.enabled) notFound();

  const projects = await listProjectsByCategory(category.id, { publishedOnly: true });

  return (
    <CategoryShowcase
      category={category}
      parent={division}
      projects={projects}
      allCategories={categories}
      breadcrumbBase={[{ label: division.name, href: "/3d-design" }]}
    />
  );
}
