/**
 * Safe, idempotent migration from the old flat 6-category taxonomy to the new
 * 2D Design / 3D Design hierarchy. Dry-run by default — prints exactly what it
 * would do. Pass --apply to actually write changes.
 *
 * Also safe to run against a database that already ran an earlier version of
 * this script targeting the (now renamed) "2d" / "3d-model" pillar slugs —
 * step 0 below renames those pillars to "2d-design" / "3d-design" in place
 * first, so everything downstream just sees the final names.
 *
 * Never deletes a project. The only category ever deleted is the old
 * "city-permit-drawings" category, and only after every project referencing
 * it has been reassigned to 2D Architecture and a doc count of zero is
 * confirmed.
 *
 * Usage:
 *   tsx --env-file-if-exists=.env.local scripts/migrate-2d-3d-hierarchy.ts            # dry run
 *   tsx --env-file-if-exists=.env.local scripts/migrate-2d-3d-hierarchy.ts --apply    # commit
 */
import { adminDb } from "../src/lib/firebase-admin";
import { SEED_CATEGORIES, type SeedCategory } from "../src/lib/constants";

const APPLY = process.argv.includes("--apply");

interface RawCategory {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
}

interface RawProject {
  id: string;
  categoryId: string;
  categorySlug: string;
  title: string;
}

// old top-level slug -> where it gets repurposed to (parent slug + slug in the new tree)
const REPURPOSE: Record<string, { parentSlug: string; slug: string }> = {
  "2d-architectural-design": { parentSlug: "2d-design", slug: "architecture" },
  "3d-architectural-visualization": { parentSlug: "3d-design", slug: "architecture" },
  "3d-character-modeling": { parentSlug: "3d-design", slug: "character" },
  "3d-environment-modeling": { parentSlug: "3d-design", slug: "environment" },
  "3d-props-object-modeling": { parentSlug: "3d-design", slug: "props-objects" },
};

// pillar slug from an earlier run of this script -> its current name
const PILLAR_RENAMES: Record<string, string> = { "2d": "2d-design", "3d-model": "3d-design" };

// old category slug -> old slug of the category its projects should be folded into
const MERGE_INTO: Record<string, string> = {
  "city-permit-drawings": "2d-architectural-design",
};

function findSeed(parentSlug: string | undefined, slug: string): SeedCategory {
  const seed = SEED_CATEGORIES.find((s) => s.parentSlug === parentSlug && s.slug === slug);
  if (!seed) throw new Error(`No seed definition for parentSlug=${parentSlug} slug=${slug}`);
  return seed;
}

async function main() {
  const categorySnap = await adminDb.collection("categories").get();
  const categories: RawCategory[] = categorySnap.docs.map((d) => ({
    id: d.id,
    slug: d.data().slug,
    name: d.data().name,
    parentId: d.data().parentId ?? null,
  }));

  const projectSnap = await adminDb.collection("projects").get();
  const projects: RawProject[] = projectSnap.docs.map((d) => ({
    id: d.id,
    categoryId: d.data().categoryId,
    categorySlug: d.data().categorySlug,
    title: d.data().title,
  }));

  const bySlug = (slug: string) => categories.find((c) => c.slug === slug && !c.parentId);
  const log = (msg: string) => console.log(msg);
  const plan: (() => Promise<void>)[] = [];

  // 0. Rename pillars from an earlier run of this script, if present. Mutates the
  // in-memory record immediately so every lookup below sees the final slug, even
  // in a dry run where the Firestore write itself is deferred.
  for (const [oldPillarSlug, newPillarSlug] of Object.entries(PILLAR_RENAMES)) {
    const existing = bySlug(oldPillarSlug);
    if (!existing) continue;
    const seed = findSeed(undefined, newPillarSlug);
    log(`[rename] pillar "${oldPillarSlug}" (${existing.id}) -> "${newPillarSlug}"`);
    existing.slug = newPillarSlug;
    existing.name = seed.name;
    plan.push(async () => {
      await adminDb.collection("categories").doc(existing.id).update({
        slug: seed.slug,
        name: seed.name,
        shortName: seed.shortName,
        description: seed.description,
        intro: seed.intro,
        updatedAt: new Date(),
      });
    });
  }

  // 1. Ensure the two top-level pillars exist.
  const pillarIds: Record<string, string> = {};
  for (const pillarSlug of ["2d-design", "3d-design"]) {
    const existing = bySlug(pillarSlug);
    if (existing) {
      pillarIds[pillarSlug] = existing.id;
      log(`[ok] pillar "${pillarSlug}" already exists (${existing.id})`);
      continue;
    }
    const seed = findSeed(undefined, pillarSlug);
    log(`[create] pillar "${pillarSlug}" (${seed.name})`);
    plan.push(async () => {
      const ref = await adminDb.collection("categories").add({
        slug: seed.slug,
        name: seed.name,
        shortName: seed.shortName,
        description: seed.description,
        intro: seed.intro,
        capabilities: seed.capabilities,
        parentId: null,
        order: seed.order,
        enabled: true,
        coverImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      pillarIds[pillarSlug] = ref.id;
    });
  }

  // Resolve pillar ids up front for dry-run reporting even if they don't exist yet.
  for (const pillarSlug of ["2d-design", "3d-design"]) {
    if (!pillarIds[pillarSlug]) {
      const existing = bySlug(pillarSlug);
      if (existing) pillarIds[pillarSlug] = existing.id;
    }
  }

  // 2. Repurpose old top-level categories into new subcategories (same doc id).
  const oldIdToNewCategoryId: Record<string, string> = {};
  const oldIdToNewSlug: Record<string, string> = {};

  for (const [oldSlug, target] of Object.entries(REPURPOSE)) {
    const old = bySlug(oldSlug);
    const seed = findSeed(target.parentSlug, target.slug);

    // Already migrated? (a category with the new slug already exists under the right parent)
    const alreadyMigrated = categories.find(
      (c) => c.slug === target.slug && c.parentId === pillarIds[target.parentSlug]
    );
    if (alreadyMigrated) {
      oldIdToNewCategoryId[old?.id ?? oldSlug] = alreadyMigrated.id;
      oldIdToNewSlug[alreadyMigrated.id] = target.slug;
      log(`[ok] "${oldSlug}" already migrated -> "${seed.name}" (${alreadyMigrated.id})`);
      continue;
    }

    if (old) {
      log(`[repurpose] "${old.name}" (${old.id}) -> "${seed.name}" under ${target.parentSlug}`);
      oldIdToNewCategoryId[old.id] = old.id;
      oldIdToNewSlug[old.id] = target.slug;
      plan.push(async () => {
        await adminDb.collection("categories").doc(old.id).update({
          slug: seed.slug,
          name: seed.name,
          shortName: seed.shortName,
          description: seed.description,
          intro: seed.intro,
          capabilities: seed.capabilities,
          parentId: pillarIds[target.parentSlug],
          order: seed.order,
          enabled: true,
          updatedAt: new Date(),
        });
      });
    } else {
      log(`[create] "${seed.name}" under ${target.parentSlug} (no old category to repurpose)`);
      plan.push(async () => {
        const ref = await adminDb.collection("categories").add({
          slug: seed.slug,
          name: seed.name,
          shortName: seed.shortName,
          description: seed.description,
          intro: seed.intro,
          capabilities: seed.capabilities,
          parentId: pillarIds[target.parentSlug],
          order: seed.order,
          enabled: true,
          coverImageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        oldIdToNewCategoryId[oldSlug] = ref.id;
        oldIdToNewSlug[ref.id] = target.slug;
      });
    }
  }

  // 3. Merge categories (e.g. city-permit-drawings) into their repurposed target, then delete the empty shell.
  for (const [oldSlug, targetOldSlug] of Object.entries(MERGE_INTO)) {
    const old = bySlug(oldSlug);
    if (!old) {
      log(`[ok] "${oldSlug}" does not exist, nothing to merge`);
      continue;
    }
    const targetId = oldIdToNewCategoryId[targetOldSlug] ?? bySlug(targetOldSlug)?.id;
    const targetSlug = targetId ? oldIdToNewSlug[targetId] : undefined;
    if (!targetId || !targetSlug) {
      log(`[skip] cannot resolve merge target for "${oldSlug}" -> "${targetOldSlug}" yet; re-run after applying`);
      continue;
    }

    const affected = projects.filter((p) => p.categoryId === old.id);
    log(`[merge] "${old.name}" (${old.id}, ${affected.length} project(s)) -> category ${targetId}, then delete`);
    plan.push(async () => {
      for (const p of affected) {
        await adminDb.collection("projects").doc(p.id).update({
          categoryId: targetId,
          categorySlug: targetSlug,
          updatedAt: new Date(),
        });
      }
      const remaining = await adminDb.collection("projects").where("categoryId", "==", old.id).get();
      if (!remaining.empty) {
        throw new Error(`Refusing to delete "${oldSlug}" — ${remaining.size} project(s) still reference it.`);
      }
      await adminDb.collection("categories").doc(old.id).delete();
    });
  }

  // 4. Fix up any project whose denormalized categorySlug no longer matches its (possibly renamed) category.
  for (const p of projects) {
    const newSlug = oldIdToNewSlug[p.categoryId];
    if (newSlug && p.categorySlug !== newSlug) {
      log(`[fix] project "${p.title}" (${p.id}) categorySlug "${p.categorySlug}" -> "${newSlug}"`);
      plan.push(async () => {
        await adminDb.collection("projects").doc(p.id).update({ categorySlug: newSlug, updatedAt: new Date() });
      });
    }
  }

  log(`\n${plan.length} change(s) planned.`);
  if (!APPLY) {
    log("Dry run only — re-run with --apply to commit these changes.");
    return;
  }

  log("Applying...");
  for (const step of plan) {
    await step();
  }
  log("Done.");
  log(
    '\nNext: run "npm run seed" once more — it will add Technical Drawing and 2D Character Art ' +
      "(brand-new categories with no legacy equivalent to repurpose) without touching anything just migrated."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
