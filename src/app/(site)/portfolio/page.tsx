import type { Metadata } from "next";
import Link from "next/link";
import { listCategories } from "@/lib/data/categories";
import { listAllProjects } from "@/lib/data/projects";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Browse Neo Vision Team's portfolio across architecture, visualization, and 3D modeling.",
};

export default async function PortfolioIndexPage() {
  const [categories, projects] = await Promise.all([listCategories(), listAllProjects()]);
  const published = projects.filter((p) => p.status === "published");
  const topLevel = categories.filter((c) => !c.parentId);

  return (
    <div>
      <section className="bg-stone-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Portfolio</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Our work</h1>
          <p className="mt-4 max-w-2xl text-stone-300">
            Explore projects across 2D architectural design, 3D visualization, and 3D modeling — from
            construction drawings to fully realized digital worlds.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {topLevel.map((c) => {
            const subcategories = categories.filter((sc) => sc.parentId === c.id);
            const count = published.filter(
              (p) => p.categoryId === c.id || subcategories.some((sc) => sc.id === p.categoryId)
            ).length;
            return (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-2xl border border-stone-200 p-8 transition hover:border-amber-400 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h2 className="font-display text-2xl font-semibold text-stone-900">{c.name}</h2>
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">
                      {count} project{count === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-500">{c.description}</p>
                  {subcategories.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {subcategories.map((sc) => (
                        <Link
                          key={sc.id}
                          href={`/portfolio/${sc.slug}`}
                          className="rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600 hover:border-amber-400 hover:text-amber-600"
                        >
                          {sc.shortName || sc.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <Link
                  href={`/portfolio/${c.slug}`}
                  className="mt-6 inline-block text-sm font-semibold text-amber-600 hover:text-amber-700"
                >
                  Explore {c.shortName || c.name} →
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
