import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listCategories } from "@/lib/data/categories";
import { DivisionLanding } from "@/components/site/division-landing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "2D Design",
  description: "2D architectural drawing, technical drawing, and character art from Neo Vision Team.",
};

export default async function TwoDDesignLandingPage() {
  const categories = await listCategories();
  const division = categories.find((c) => c.slug === "2d-design" && !c.parentId);
  if (!division || !division.enabled) notFound();

  const subcategories = categories
    .filter((c) => c.parentId === division.id && c.enabled)
    .sort((a, b) => a.order - b.order);

  return <DivisionLanding division={division} subcategories={subcategories} accent="amber" />;
}
