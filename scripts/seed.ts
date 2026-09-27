import { adminDb } from "../src/lib/firebase-admin";
import { SEED_CATEGORIES } from "../src/lib/constants";
import { createCategory, getCategoryBySlug, getChildCategoryBySlug } from "../src/lib/data/categories";
import { DEFAULT_SITE_CONTENT } from "../src/lib/data/site-content";

async function main() {
  console.log("Seeding categories...");
  const slugToId: Record<string, string> = {};

  // First pass: top-level categories (no parentSlug)
  for (const cat of SEED_CATEGORIES.filter((c) => !c.parentSlug)) {
    const existing = await getCategoryBySlug(cat.slug);
    if (existing) {
      slugToId[cat.slug] = existing.id;
      console.log(`  exists: ${cat.name}`);
      continue;
    }
    const id = await createCategory({
      name: cat.name,
      shortName: cat.shortName,
      description: cat.description,
      intro: cat.intro,
      capabilities: cat.capabilities,
      order: cat.order,
      slug: cat.slug,
      parentId: null,
    });
    slugToId[cat.slug] = id;
    console.log(`  created: ${cat.name}`);
  }

  // Second pass: categories with a parent. Existence is checked scoped to the
  // parent, since sibling slugs like "architecture" now legitimately repeat
  // across different pillars (2D vs 3D Model).
  for (const cat of SEED_CATEGORIES.filter((c) => c.parentSlug)) {
    const parentId = cat.parentSlug ? slugToId[cat.parentSlug] : null;
    const existing = parentId ? await getChildCategoryBySlug(parentId, cat.slug) : null;
    if (existing) {
      console.log(`  exists: ${cat.name}`);
      continue;
    }
    const id = await createCategory({
      name: cat.name,
      shortName: cat.shortName,
      description: cat.description,
      intro: cat.intro,
      capabilities: cat.capabilities,
      order: cat.order,
      slug: cat.slug,
      parentId: parentId ?? null,
    });
    console.log(`  created: ${cat.name}`);
    slugToId[cat.slug] = id;
  }

  console.log("Seeding default site content (if missing)...");
  const doc = await adminDb.collection("siteContent").doc("main").get();
  if (!doc.exists) {
    await adminDb.collection("siteContent").doc("main").set(DEFAULT_SITE_CONTENT);
    console.log("  created default site content");
  } else {
    console.log("  site content already exists, skipping");
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
