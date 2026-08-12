import Link from "next/link";
import { listCategories } from "@/lib/data/categories";
import { listAllProjects } from "@/lib/data/projects";

export default async function AdminCategoriesPage() {
  const [categories, projects] = await Promise.all([listCategories(), listAllProjects()]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Categories</h1>
          <p className="mt-1 text-stone-500">Manage your portfolio categories and subcategories.</p>
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
              <th className="px-4 py-3 font-medium">Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {categories.map((c) => {
              const parent = categories.find((p) => p.id === c.parentId);
              const count = projects.filter((p) => p.categoryId === c.id).length;
              return (
                <tr key={c.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/categories/${c.id}`} className="font-medium text-stone-900 hover:text-amber-600">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{c.slug}</td>
                  <td className="px-4 py-3 text-stone-500">{parent?.name || "—"}</td>
                  <td className="px-4 py-3 text-stone-500">{count}</td>
                  <td className="px-4 py-3 text-stone-500">{c.order}</td>
                </tr>
              );
            })}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
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
