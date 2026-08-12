"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCategoryById } from "@/lib/data/categories";
import {
  createProject,
  deleteProject,
  getProjectById,
  updateProject,
} from "@/lib/data/projects";
import { deleteStoragePath, uploadGenericFile, uploadImageFile, uploadBuffer } from "@/lib/upload";
import { generatePdfPreviewPng } from "@/lib/pdf";
import { isRealFile, validateImageFile, validatePdfFile } from "@/lib/validation";
import type { ProjectFile, ProjectImage, ProjectStatus } from "@/types";
import { randomUUID } from "crypto";

export interface ProjectFormState {
  error?: string;
}

interface ParsedFields {
  title: string;
  description: string;
  categoryId: string;
  year: number | null;
  client: string | null;
  projectType: string | null;
  featured: boolean;
  status: ProjectStatus;
  order: number;
}

function parseFields(formData: FormData): ParsedFields | { error: string } {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const categoryId = String(formData.get("categoryId") || "").trim();
  const yearRaw = String(formData.get("year") || "").trim();
  const client = String(formData.get("client") || "").trim() || null;
  const projectType = String(formData.get("projectType") || "").trim() || null;
  const featured = formData.get("featured") === "on";
  const status = (String(formData.get("status") || "draft") as ProjectStatus) || "draft";
  const order = Number(formData.get("order") || 0);

  if (!title || !description || !categoryId) {
    return { error: "Title, description, and category are required." };
  }

  return {
    title,
    description,
    categoryId,
    year: yearRaw ? Number(yearRaw) : null,
    client,
    projectType,
    featured,
    status,
    order,
  };
}

async function processPdf(folder: string, file: File): Promise<{ pdf: ProjectFile; previewUrl: string | null }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const pdfUpload = await uploadGenericFile(file, `${folder}/pdf`);

  let previewUrl: string | null = null;
  try {
    const previewBuffer = await generatePdfPreviewPng(buffer);
    const { url } = await uploadBuffer({
      buffer: previewBuffer,
      path: `${folder}/pdf-preview/${randomUUID()}.png`,
      contentType: "image/png",
    });
    previewUrl = url;
  } catch (err) {
    console.error("PDF preview generation failed:", err);
  }

  return { pdf: pdfUpload, previewUrl };
}

export async function createProjectAction(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  await requireAdmin();

  const parsed = parseFields(formData);
  if ("error" in parsed) return parsed;

  const category = await getCategoryById(parsed.categoryId);
  if (!category) return { error: "Selected category was not found." };

  const folder = `projects/${randomUUID()}`;

  const coverFile = formData.get("coverImage");
  const galleryFiles = formData.getAll("images").filter(isRealFile) as File[];
  const pdfFile = formData.get("pdf");
  const additionalFiles = formData.getAll("additionalFiles").filter(isRealFile) as File[];

  for (const f of galleryFiles) {
    const err = validateImageFile(f);
    if (err) return { error: err };
  }
  if (isRealFile(coverFile)) {
    const err = validateImageFile(coverFile);
    if (err) return { error: err };
  }
  if (isRealFile(pdfFile)) {
    const err = validatePdfFile(pdfFile);
    if (err) return { error: err };
  }

  let coverImage: ProjectImage | null = null;
  if (isRealFile(coverFile)) {
    coverImage = await uploadImageFile(coverFile, `${folder}/cover`);
  }

  const images: ProjectImage[] = [];
  for (const f of galleryFiles) {
    images.push(await uploadImageFile(f, `${folder}/gallery`));
  }

  // Fall back to the first gallery image as the cover if none was provided.
  if (!coverImage && images.length > 0) {
    coverImage = images[0];
  }

  let pdf: ProjectFile | null = null;
  let pdfPreviewUrl: string | null = null;
  if (isRealFile(pdfFile)) {
    const result = await processPdf(folder, pdfFile);
    pdf = result.pdf;
    pdfPreviewUrl = result.previewUrl;
  }

  const additional: ProjectFile[] = [];
  for (const f of additionalFiles) {
    additional.push(await uploadGenericFile(f, `${folder}/files`));
  }

  const id = await createProject({
    title: parsed.title,
    description: parsed.description,
    categoryId: parsed.categoryId,
    categorySlug: category.slug,
    coverImage,
    images,
    pdf,
    pdfPreviewUrl,
    additionalFiles: additional,
    year: parsed.year,
    client: parsed.client,
    projectType: parsed.projectType,
    featured: parsed.featured,
    status: parsed.status,
    order: parsed.order,
  });

  revalidatePath("/admin/projects");
  revalidatePath(`/portfolio/${category.slug}`);
  revalidatePath("/");
  redirect(`/admin/projects/${id}`);
}

export async function updateProjectAction(
  id: string,
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  await requireAdmin();

  const existing = await getProjectById(id);
  if (!existing) return { error: "Project not found." };

  const parsed = parseFields(formData);
  if ("error" in parsed) return parsed;

  const category = await getCategoryById(parsed.categoryId);
  if (!category) return { error: "Selected category was not found." };

  const folder = `projects/${id}`;

  const coverFile = formData.get("coverImage");
  const galleryFiles = formData.getAll("images").filter(isRealFile) as File[];
  const pdfFile = formData.get("pdf");
  const additionalFiles = formData.getAll("additionalFiles").filter(isRealFile) as File[];
  const removeImagePaths = formData.getAll("removeImages").map(String);
  const removeFilePaths = formData.getAll("removeFiles").map(String);
  const removePdf = formData.get("removePdf") === "on";

  for (const f of galleryFiles) {
    const err = validateImageFile(f);
    if (err) return { error: err };
  }
  if (isRealFile(coverFile)) {
    const err = validateImageFile(coverFile);
    if (err) return { error: err };
  }
  if (isRealFile(pdfFile)) {
    const err = validatePdfFile(pdfFile);
    if (err) return { error: err };
  }

  let coverImage = existing.coverImage;
  if (isRealFile(coverFile)) {
    await deleteStoragePath(existing.coverImage?.path);
    coverImage = await uploadImageFile(coverFile, `${folder}/cover`);
  }

  const images = existing.images.filter((img) => !removeImagePaths.includes(img.path));
  for (const path of removeImagePaths) {
    await deleteStoragePath(path);
  }
  for (const f of galleryFiles) {
    images.push(await uploadImageFile(f, `${folder}/gallery`));
  }

  if (!coverImage && images.length > 0) {
    coverImage = images[0];
  }
  if (coverImage && !images.find((i) => i.path === coverImage!.path) && removeImagePaths.includes(coverImage.path)) {
    coverImage = images[0] ?? null;
  }

  let pdf = existing.pdf;
  let pdfPreviewUrl = existing.pdfPreviewUrl;
  if (isRealFile(pdfFile)) {
    await deleteStoragePath(existing.pdf?.path);
    const result = await processPdf(folder, pdfFile);
    pdf = result.pdf;
    pdfPreviewUrl = result.previewUrl;
  } else if (removePdf) {
    await deleteStoragePath(existing.pdf?.path);
    pdf = null;
    pdfPreviewUrl = null;
  }

  const additional = existing.additionalFiles.filter((f) => !removeFilePaths.includes(f.path));
  for (const path of removeFilePaths) {
    await deleteStoragePath(path);
  }
  for (const f of additionalFiles) {
    additional.push(await uploadGenericFile(f, `${folder}/files`));
  }

  await updateProject(id, {
    title: parsed.title,
    description: parsed.description,
    categoryId: parsed.categoryId,
    categorySlug: category.slug,
    coverImage,
    images,
    pdf,
    pdfPreviewUrl,
    additionalFiles: additional,
    year: parsed.year,
    client: parsed.client,
    projectType: parsed.projectType,
    featured: parsed.featured,
    status: parsed.status,
    order: parsed.order,
  });

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath(`/portfolio/${category.slug}`);
  if (existing.categorySlug !== category.slug) {
    revalidatePath(`/portfolio/${existing.categorySlug}`);
  }
  revalidatePath("/");
  return {};
}

export async function deleteProjectAction(id: string) {
  await requireAdmin();
  const existing = await getProjectById(id);
  if (!existing) redirect("/admin/projects");

  await Promise.all([
    deleteStoragePath(existing!.coverImage?.path),
    ...existing!.images.map((i) => deleteStoragePath(i.path)),
    deleteStoragePath(existing!.pdf?.path),
    ...existing!.additionalFiles.map((f) => deleteStoragePath(f.path)),
  ]);
  await deleteProject(id);

  revalidatePath("/admin/projects");
  revalidatePath(`/portfolio/${existing!.categorySlug}`);
  revalidatePath("/");
  redirect("/admin/projects");
}

export async function moveProjectAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  const project = await getProjectById(id);
  if (!project) return;

  const { listProjectsByCategory } = await import("@/lib/data/projects");
  const siblings = await listProjectsByCategory(project.categorySlug);
  const index = siblings.findIndex((p) => p.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) return;

  const sibling = siblings[swapIndex];
  await Promise.all([
    updateProject(project.id, { order: sibling.order }),
    updateProject(sibling.id, { order: project.order }),
  ]);

  revalidatePath("/admin/projects");
  revalidatePath(`/portfolio/${project.categorySlug}`);
}
