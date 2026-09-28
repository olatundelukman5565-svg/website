"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  createCategory,
  deleteCategory,
  listCategories,
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
  const enabled = formData.get("enabled") === "on";

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
    enabled,
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
  const enabled = formData.get("enabled") === "on";

  if (!name || !description || !intro) {
    return { error: "Name, description, and introduction are required." };
  }

  await updateCategory(id, { name, description, intro, capabilities, order, parentId, enabled });

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

export async function moveCategoryAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  const all = await listCategories();
  const current = all.find((c) => c.id === id);
  if (!current) return;

  const siblings = all
    .filter((c) => (c.parentId ?? null) === (current.parentId ?? null))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  const index = siblings.findIndex((c) => c.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) return;

  const sibling = siblings[swapIndex];
  await Promise.all([
    updateCategory(current.id, { order: sibling.order }),
    updateCategory(sibling.id, { order: current.order }),
  ]);

  revalidatePath("/admin/categories");
  revalidatePath("/portfolio");
}
