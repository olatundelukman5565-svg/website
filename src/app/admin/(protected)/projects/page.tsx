import Link from "next/link";
import Image from "next/image";
import { listAllProjects } from "@/lib/data/projects";
import { listCategories } from "@/lib/data/categories";
import { MoveButtons } from "@/components/admin/move-buttons";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryFilter } = await searchParams;
  const [projects, categories] = await Promise.all([listAllProjects(), listCategories()]);

  const filtered = categoryFilter
    ? projects.filter((p) => p.categoryId === categoryFilter)
    : projects;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Projects</h1>
          <p className="mt-1 text-stone-500">{projects.length} total projects across all categories.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          + Add project
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/projects"
          className={`rounded-full px-3 py-1 text-sm ${
            !categoryFilter ? "bg-stone-900 text-white" : "bg-white text-stone-600 border border-stone-200"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/admin/projects?category=${c.id}`}
            className={`rounded-full px-3 py-1 text-sm ${
              categoryFilter === c.id ? "bg-stone-900 text-white" : "bg-white text-stone-600 border border-stone-200"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-left text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((p) => {
              const cat = categories.find((c) => c.id === p.categoryId);
              return (
                <tr key={p.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.coverImage ? (
                        <Image
                          src={p.coverImage.url}
                          alt=""
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-stone-100" />
                      )}
                      <Link href={`/admin/projects/${p.id}`} className="font-medium text-stone-900 hover:text-amber-600">
                        {p.title}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{cat?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.status === "published"
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                          : "rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500"
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{p.featured ? "★" : ""}</td>
                  <td className="px-4 py-3">
                    <MoveButtons id={p.id} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-amber-400 hover:text-amber-600"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  No projects yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
