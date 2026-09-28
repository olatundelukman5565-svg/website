"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { runTwoDThreeDMigration, type MigrationResult } from "@/lib/migrations/two-d-three-d";

export async function previewMigrationAction(): Promise<MigrationResult> {
  await requireAdmin();
  return runTwoDThreeDMigration(false);
}

export async function applyMigrationAction(): Promise<MigrationResult> {
  await requireAdmin();
  const result = await runTwoDThreeDMigration(true);
  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
  return result;
}
