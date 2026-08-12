import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import type { Project, ProjectFile, ProjectImage, ProjectStatus } from "@/types";
import { ensureUniqueSlug } from "@/lib/slug";

const COLLECTION = "projects";

function toProject(id: string, data: FirebaseFirestore.DocumentData): Project {
  return {
    id,
    slug: data.slug,
    title: data.title,
    description: data.description ?? "",
    categoryId: data.categoryId,
    categorySlug: data.categorySlug,
    coverImage: data.coverImage ?? null,
    images: data.images ?? [],
    pdf: data.pdf ?? null,
    pdfPreviewUrl: data.pdfPreviewUrl ?? null,
    additionalFiles: data.additionalFiles ?? [],
    year: data.year ?? null,
    client: data.client ?? null,
    projectType: data.projectType ?? null,
    featured: !!data.featured,
    status: (data.status as ProjectStatus) ?? "draft",
    order: data.order ?? 0,
    createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
  };
}

export interface ProjectInput {
  title: string;
  description: string;
  categoryId: string;
  categorySlug: string;
  coverImage?: ProjectImage | null;
  images?: ProjectImage[];
  pdf?: ProjectFile | null;
  pdfPreviewUrl?: string | null;
  additionalFiles?: ProjectFile[];
  year?: number | null;
  client?: string | null;
  projectType?: string | null;
  featured?: boolean;
  status?: ProjectStatus;
  order?: number;
  slug?: string;
}

async function slugExists(slug: string) {
  const snap = await adminDb.collection(COLLECTION).where("slug", "==", slug).limit(1).get();
  return !snap.empty;
}

export async function createProject(input: ProjectInput): Promise<string> {
  const slug = await ensureUniqueSlug(input.slug || input.title, slugExists);
  const now = FieldValue.serverTimestamp();
  const ref = await adminDb.collection(COLLECTION).add({
    ...input,
    slug,
    images: input.images ?? [],
    additionalFiles: input.additionalFiles ?? [],
    featured: input.featured ?? false,
    status: input.status ?? "draft",
    order: input.order ?? 0,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateProject(id: string, input: Partial<ProjectInput>): Promise<void> {
  const updates: Record<string, unknown> = { ...input, updatedAt: FieldValue.serverTimestamp() };
  if (input.title && !input.slug) {
    const current = await getProjectById(id);
    if (current) {
      const { toSlug } = await import("@/lib/slug");
      if (toSlug(input.title) !== current.slug) {
        updates.slug = await ensureUniqueSlug(input.title, async (candidate) => {
          if (candidate === current.slug) return false;
          return slugExists(candidate);
        });
      }
    }
  }
  await adminDb.collection(COLLECTION).doc(id).update(updates);
}

export async function deleteProject(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}

export async function getProjectById(id: string): Promise<Project | null> {
  const doc = await adminDb.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return toProject(doc.id, doc.data()!);
}

export async function getProjectBySlug(
  categorySlug: string,
  projectSlug: string
): Promise<Project | null> {
  const snap = await adminDb
    .collection(COLLECTION)
    .where("categorySlug", "==", categorySlug)
    .where("slug", "==", projectSlug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return toProject(doc.id, doc.data());
}

export async function listAllProjects(): Promise<Project[]> {
  const snap = await adminDb.collection(COLLECTION).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => toProject(d.id, d.data()));
}

export async function listProjectsByCategory(
  categorySlug: string,
  options: { publishedOnly?: boolean } = {}
): Promise<Project[]> {
  let query = adminDb.collection(COLLECTION).where("categorySlug", "==", categorySlug) as FirebaseFirestore.Query;
  if (options.publishedOnly) {
    query = query.where("status", "==", "published");
  }
  const snap = await query.get();
  const projects = snap.docs.map((d) => toProject(d.id, d.data()));
  return projects.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export async function listFeaturedProjects(limit = 6): Promise<Project[]> {
  const snap = await adminDb
    .collection(COLLECTION)
    .where("featured", "==", true)
    .where("status", "==", "published")
    .get();
  const projects = snap.docs.map((d) => toProject(d.id, d.data()));
  return projects.sort((a, b) => a.order - b.order).slice(0, limit);
}

export async function listRelatedProjects(
  categorySlug: string,
  excludeId: string,
  limit = 3
): Promise<Project[]> {
  const projects = await listProjectsByCategory(categorySlug, { publishedOnly: true });
  return projects.filter((p) => p.id !== excludeId).slice(0, limit);
}

export async function listPublishedProjectsByIds(ids: string[]): Promise<Project[]> {
  if (ids.length === 0) return [];
  const docs = await Promise.all(ids.map((id) => adminDb.collection(COLLECTION).doc(id).get()));
  return docs
    .filter((d) => d.exists && d.data()?.status === "published")
    .map((d) => toProject(d.id, d.data()!));
}
