import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listCategories } from "@/lib/data/categories";
import { DivisionLanding } from "@/components/site/division-landing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "3D Model",
  description: "3D architectural visualization, printing & sculpture, and character modeling from Neo Vision Team.",
};

export default async function ThreeDModelLandingPage() {
  const categories = await listCategories();
  const division = categories.find((c) => c.slug === "3d-model" && !c.parentId);
  if (!division || !division.enabled) notFound();

  const subcategories = categories
    .filter((c) => c.parentId === division.id && c.enabled)
    .sort((a, b) => a.order - b.order);

  return <DivisionLanding division={division} subcategories={subcategories} accent="emerald" />;
}
