import Link from "next/link";
import { listCategories } from "@/lib/data/categories";
import { listAllProjects } from "@/lib/data/projects";
import { listMessages } from "@/lib/data/messages";

export default async function AdminDashboardPage() {
  const [categories, projects, messages] = await Promise.all([
    listCategories(),
    listAllProjects(),
    listMessages(),
  ]);

  const published = projects.filter((p) => p.status === "published").length;
  const drafts = projects.filter((p) => p.status === "draft").length;
  const unread = messages.filter((m) => !m.read).length;

  const stats = [
    { label: "Categories", value: categories.length, href: "/admin/categories" },
    { label: "Published projects", value: published, href: "/admin/projects" },
    { label: "Draft projects", value: drafts, href: "/admin/projects" },
    { label: "Unread messages", value: unread, href: "/admin/messages" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
      <p className="mt-1 text-stone-500">Overview of your portfolio content.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-stone-200 bg-white p-5 transition hover:border-amber-400 hover:shadow-sm"
          >
            <p className="text-3xl font-semibold text-stone-900">{s.value}</p>
            <p className="mt-1 text-sm text-stone-500">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900">Quick actions</h2>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/admin/projects/new" className="text-sm font-medium text-amber-600 hover:underline">
              + Add a new project
            </Link>
            <Link href="/admin/categories/new" className="text-sm font-medium text-amber-600 hover:underline">
              + Add a new category
            </Link>
            <Link href="/admin/settings" className="text-sm font-medium text-amber-600 hover:underline">
              Edit homepage, about & contact content
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900">Recent projects</h2>
          <ul className="mt-3 divide-y divide-stone-100">
            {projects.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/admin/projects/${p.id}`} className="text-stone-700 hover:text-amber-600">
                  {p.title}
                </Link>
                <span
                  className={
                    p.status === "published"
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                      : "rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500"
                  }
                >
                  {p.status}
                </span>
              </li>
            ))}
            {projects.length === 0 && <li className="py-2 text-sm text-stone-400">No projects yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
