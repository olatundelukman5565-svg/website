import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import type { Category } from "@/types";
import { ensureUniqueSlug, toSlug } from "@/lib/slug";

const COLLECTION = "categories";

function toCategory(id: string, data: FirebaseFirestore.DocumentData): Category {
  return {
    id,
    slug: data.slug,
    name: data.name,
    shortName: data.shortName ?? undefined,
    description: data.description ?? "",
    intro: data.intro ?? "",
    capabilities: data.capabilities ?? [],
    parentId: data.parentId ?? null,
    order: data.order ?? 0,
    coverImageUrl: data.coverImageUrl ?? null,
    createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
  };
}

export async function listCategories(): Promise<Category[]> {
  const snap = await adminDb.collection(COLLECTION).orderBy("order", "asc").get();
  return snap.docs.map((d) => toCategory(d.id, d.data()));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const snap = await adminDb.collection(COLLECTION).where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return toCategory(doc.id, doc.data());
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const doc = await adminDb.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return toCategory(doc.id, doc.data()!);
}

export interface CategoryInput {
  name: string;
  shortName?: string;
  description: string;
  intro: string;
  capabilities: string[];
  parentId?: string | null;
  order: number;
  coverImageUrl?: string | null;
  slug?: string;
}

export async function createCategory(input: CategoryInput): Promise<string> {
  const slug = await ensureUniqueSlug(input.slug || input.name, async (candidate) => {
    const existing = await getCategoryBySlug(candidate);
    return !!existing;
  });
  const now = FieldValue.serverTimestamp();
  const ref = await adminDb.collection(COLLECTION).add({
    ...input,
    slug,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<void> {
  const updates: Record<string, unknown> = { ...input, updatedAt: FieldValue.serverTimestamp() };
  if (input.name && !input.slug) {
    const current = await getCategoryById(id);
    if (current && toSlug(input.name) !== current.slug) {
      updates.slug = await ensureUniqueSlug(input.name, async (candidate) => {
        if (candidate === current.slug) return false;
        const existing = await getCategoryBySlug(candidate);
        return !!existing;
      });
    }
  }
  await adminDb.collection(COLLECTION).doc(id).update(updates);
}

export async function deleteCategory(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}
