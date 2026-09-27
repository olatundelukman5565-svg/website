import Link from "next/link";
import type { Category, Project } from "@/types";
import { categoryHref, projectHref } from "@/lib/portfolio-paths";
import { ProjectCard } from "@/components/site/project-card";

/**
 * Renders a subcategory's full landing experience: breadcrumb, intro, capability
 * pills, and its published project grid. Shared by both the new /2d-design/[subcategory]
 * and /3d-design/[subcategory] routes and the legacy /portfolio/[category] route,
 * so there is exactly one portfolio rendering implementation, not several.
 */
export function CategoryShowcase({
  category,
  parent,
  projects,
  allCategories,
  breadcrumbBase,
}: {
  category: Category;
  parent: Category | null;
  projects: Project[];
  allCategories: Category[];
  /** e.g. [{label:"2D Design", href:"/2d-design"}] */
  breadcrumbBase: { label: string; href: string }[];
}) {
  return (
    <div>
      <section className="bg-stone-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-stone-400">
            <Link href="/portfolio" className="hover:text-amber-400">
              Portfolio
            </Link>
            {breadcrumbBase.map((crumb) => (
              <span key={crumb.href} className="flex items-center gap-2">
                <span>/</span>
                <Link href={crumb.href} className="hover:text-amber-400">
                  {crumb.label}
                </Link>
              </span>
            ))}
            <span>/</span>
            <span className="text-stone-200">{category.shortName || category.name}</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">{category.name}</h1>
          <p className="mt-4 max-w-2xl text-stone-300">{category.intro}</p>

          {category.capabilities.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {category.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="rounded-full border border-stone-700 px-3.5 py-1.5 text-xs font-medium text-stone-300"
                >
                  {cap}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {projects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                href={projectHref(p, allCategories)}
                categoryName={parent ? category.shortName || category.name : undefined}
                priority={i < 3}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 p-16 text-center">
            <p className="font-display text-xl text-stone-400">Projects coming soon.</p>
            <p className="mt-2 text-sm text-stone-400">
              We&apos;re preparing work to showcase in this category.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export { categoryHref };
