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
    enabled: data.enabled ?? true,
    coverImageUrl: data.coverImageUrl ?? null,
    createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
  };
}

/**
 * Slug collisions are only checked among siblings (same parentId), not globally.
 * This lets e.g. "architecture" exist once under the 2D pillar and once under
 * 3D Model without colliding — each subcategory route is resolved by
 * (parent slug, own slug) together, never by a bare global slug lookup.
 */
async function siblingSlugExists(slug: string, parentId: string | null | undefined) {
  const snap = await adminDb
    .collection(COLLECTION)
    .where("parentId", "==", parentId ?? null)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  return !snap.empty;
}

export async function listCategories(): Promise<Category[]> {
  const snap = await adminDb.collection(COLLECTION).orderBy("order", "asc").get();
  return snap.docs.map((d) => toCategory(d.id, d.data()));
}

/** Resolves a category by slug. Only safe for top-level (parentId === null) slugs, which stay globally unique. */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const snap = await adminDb.collection(COLLECTION).where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return toCategory(doc.id, doc.data());
}

/** Resolves a subcategory scoped to its parent, so duplicate slugs across different parents never collide. */
export async function getChildCategoryBySlug(parentId: string, slug: string): Promise<Category | null> {
  const snap = await adminDb
    .collection(COLLECTION)
    .where("parentId", "==", parentId)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return toCategory(snap.docs[0].id, snap.docs[0].data());
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
  enabled?: boolean;
  coverImageUrl?: string | null;
  slug?: string;
}

export async function createCategory(input: CategoryInput): Promise<string> {
  const slug = await ensureUniqueSlug(input.slug || input.name, (candidate) =>
    siblingSlugExists(candidate, input.parentId)
  );
  const now = FieldValue.serverTimestamp();
  const ref = await adminDb.collection(COLLECTION).add({
    ...input,
    slug,
    enabled: input.enabled ?? true,
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
      const parentId = input.parentId !== undefined ? input.parentId : current.parentId;
      updates.slug = await ensureUniqueSlug(input.name, async (candidate) => {
        if (candidate === current.slug) return false;
        return siblingSlugExists(candidate, parentId);
      });
    }
  }
  await adminDb.collection(COLLECTION).doc(id).update(updates);
}

export async function deleteCategory(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}
