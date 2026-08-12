"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/data/categories";

export interface CategoryFormState {
  error?: string;
}

function parseCapabilities(raw: string): string[] {
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const intro = String(formData.get("intro") || "").trim();
  const capabilities = parseCapabilities(String(formData.get("capabilities") || ""));
  const order = Number(formData.get("order") || 0);
  const parentId = String(formData.get("parentId") || "") || null;

  if (!name || !description || !intro) {
    return { error: "Name, description, and introduction are required." };
  }

  const id = await createCategory({
    name,
    description,
    intro,
    capabilities,
    order,
    parentId,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/portfolio");
  redirect(`/admin/categories/${id}`);
}

export async function updateCategoryAction(
  id: string,
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const intro = String(formData.get("intro") || "").trim();
  const capabilities = parseCapabilities(String(formData.get("capabilities") || ""));
  const order = Number(formData.get("order") || 0);
  const parentId = String(formData.get("parentId") || "") || null;

  if (!name || !description || !intro) {
    return { error: "Name, description, and introduction are required." };
  }

  await updateCategory(id, { name, description, intro, capabilities, order, parentId });

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/portfolio");
  return {};
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  await deleteCategory(id);
  revalidatePath("/admin/categories");
  revalidatePath("/portfolio");
  redirect("/admin/categories");
}
