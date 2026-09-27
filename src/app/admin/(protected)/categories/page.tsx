import Link from "next/link";
import { listCategories } from "@/lib/data/categories";
import { listAllProjects } from "@/lib/data/projects";
import { CategoryMoveButtons } from "@/components/admin/category-move-buttons";

export default async function AdminCategoriesPage() {
  const [categories, projects] = await Promise.all([listCategories(), listAllProjects()]);

  const topLevel = categories.filter((c) => !c.parentId).sort((a, b) => a.order - b.order);
  const ordered = topLevel.flatMap((parent) => [
    parent,
    ...categories
      .filter((c) => c.parentId === parent.id)
      .sort((a, b) => a.order - b.order),
  ]);
  const orphaned = categories.filter(
    (c) => c.parentId && !categories.some((p) => p.id === c.parentId)
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Categories</h1>
          <p className="mt-1 text-stone-500">Manage the 2D / 3D Model hierarchy and their portfolio subcategories.</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          + New category
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-left text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Parent</th>
              <th className="px-4 py-3 font-medium">Projects</th>
              <th className="px-4 py-3 font-medium">Visible</th>
              <th className="px-4 py-3 font-medium">Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {[...ordered, ...orphaned].map((c) => {
              const parent = categories.find((p) => p.id === c.parentId);
              const count = projects.filter((p) => p.categoryId === c.id).length;
              return (
                <tr key={c.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/categories/${c.id}`}
                      className={`font-medium hover:text-amber-600 ${
                        c.parentId ? "pl-4 text-stone-700" : "text-stone-900"
                      }`}
                    >
                      {c.parentId ? "— " : ""}
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{c.slug}</td>
                  <td className="px-4 py-3 text-stone-500">{parent?.name || "—"}</td>
                  <td className="px-4 py-3 text-stone-500">{count}</td>
                  <td className="px-4 py-3">
                    {c.enabled ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Visible
                      </span>
                    ) : (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500">{c.order}</span>
                      <CategoryMoveButtons id={c.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  No categories yet. Create your first one to start building the portfolio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
