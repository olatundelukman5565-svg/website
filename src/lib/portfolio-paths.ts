import type { Category, Project } from "@/types";

/** The two fixed top-level pillars this site is organized around. Their slugs double as literal route segments. */
export const PRIMARY_SLUGS = ["2d", "3d-model"] as const;

/** Builds the canonical browsing URL for a category, honoring the /2d and /3d-model route structure. */
export function categoryHref(category: Category, allCategories: Category[]): string {
  if (!category.parentId) {
    return PRIMARY_SLUGS.includes(category.slug as (typeof PRIMARY_SLUGS)[number])
      ? `/${category.slug}`
      : `/portfolio/${category.slug}`;
  }
  const parent = allCategories.find((c) => c.id === category.parentId);
  if (parent && PRIMARY_SLUGS.includes(parent.slug as (typeof PRIMARY_SLUGS)[number])) {
    return `/${parent.slug}/${category.slug}`;
  }
  return `/portfolio/${category.slug}`;
}

/** Builds the canonical project detail URL from its category's hierarchy position. */
export function projectHref(project: Project, allCategories: Category[]): string {
  const category = allCategories.find((c) => c.id === project.categoryId);
  if (!category) return `/portfolio/${project.categorySlug}/${project.slug}`;
  return `${categoryHref(category, allCategories)}/${project.slug}`;
}
