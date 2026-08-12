import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, listCategories } from "@/lib/data/categories";
import { listProjectsByCategory } from "@/lib/data/projects";
import { ProjectCard } from "@/components/site/project-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const [category, categories] = await Promise.all([getCategoryBySlug(slug), listCategories()]);
  if (!category) notFound();

  const projects = await listProjectsByCategory(category.slug, { publishedOnly: true });
  const parent = category.parentId ? categories.find((c) => c.id === category.parentId) : null;
  const subcategories = categories.filter((c) => c.parentId === category.id);

  return (
    <div>
      <section className="bg-stone-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-stone-400">
            <Link href="/portfolio" className="hover:text-amber-400">
              Portfolio
            </Link>
            {parent && (
              <>
                <span>/</span>
                <Link href={`/portfolio/${parent.slug}`} className="hover:text-amber-400">
                  {parent.shortName || parent.name}
                </Link>
              </>
            )}
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

          {subcategories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {subcategories.map((sc) => (
                <Link
                  key={sc.id}
                  href={`/portfolio/${sc.slug}`}
                  className="rounded-full bg-amber-500/10 px-3.5 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/20"
                >
                  {sc.shortName || sc.name} →
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {projects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} priority={i < 3} />
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
