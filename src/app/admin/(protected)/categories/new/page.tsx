import Link from "next/link";
import { listCategories } from "@/lib/data/categories";
import { createCategoryAction } from "@/lib/actions/categories";
import { CategoryForm } from "@/components/admin/category-form";

export default async function NewCategoryPage() {
  const categories = await listCategories();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/categories" className="text-sm text-stone-500 hover:text-stone-800">
        ← Back to categories
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900">New category</h1>
      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6">
        <CategoryForm action={createCategoryAction} categories={categories} submitLabel="Create category" />
      </div>
    </div>
  );
}
