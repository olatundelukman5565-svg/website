import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryById, listCategories } from "@/lib/data/categories";
import { updateCategoryAction, deleteCategoryAction } from "@/lib/actions/categories";
import { CategoryForm } from "@/components/admin/category-form";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, categories] = await Promise.all([getCategoryById(id), listCategories()]);

  if (!category) notFound();

  const boundUpdate = updateCategoryAction.bind(null, id);
  const boundDelete = deleteCategoryAction.bind(null, id);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/categories" className="text-sm text-stone-500 hover:text-stone-800">
        ← Back to categories
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">{category.name}</h1>
        <DeleteButton
          action={boundDelete}
          confirmMessage="Delete this category? Projects in this category will remain but will need to be reassigned."
        />
      </div>
      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6">
        <CategoryForm
          action={boundUpdate}
          category={category}
          categories={categories}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
